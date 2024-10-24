<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Kreait\Firebase\Contract\Database;
use Kreait\Laravel\Firebase\Facades\Firebase;
use Kreait\Firebase\Storage;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class CustomRequestController extends Controller
{
    protected $database;
    protected $auth;
    protected $storage;

    public function __construct(Database $database)
    {
        $this->database = $database;
        $this->auth = Firebase::auth();
        $this->storage = Firebase::storage();
    }

    //inserting
    public function insertCustomizePrdRequest(Request $request)
    {
        try {

            $fullAddress = $request->address . ' - ' . $request->barangay . ', ' . $request->city . ', ' . $request->postalCode . ', ' . 'Philippines';
            $mobilePhone = $this->database->getReference('users/' . $request->uid . '/mobileNumber')->getSnapshot()->getValue();
            $email =  $this->database->getReference('users/' . $request->uid . '/email')->getSnapshot()->getValue();
            $firstName =  $this->database->getReference('users/' . $request->uid . '/firstName')->getSnapshot()->getValue();
            $lastName = $this->database->getReference('users/' . $request->uid . '/lastName')->getSnapshot()->getValue();

            $totalCustomizedPrdQnt = $request->smallQnt + $request->mediumQnt
                + $request->largeQnt + $request->extraLargeQnt + $request->doubleXLQnt + $request->tripleXLQnt;

            //get the product data
            $originalProductData = $this->database->getReference('products/' . $request->productID)->getSnapshot()->getValue();

            //geting the download url of the custom image file being passed in as request from the frontend
            $customImageFile = $request->file('customImageFile');
            $customImageFileName = 'customized/' . '' . $customImageFile->getClientOriginalName();

            $this->storage->getBucket()->upload($customImageFile->getContent(), [
                'name' => $customImageFileName
            ]);
            $firebaseStoragePath = $customImageFileName;
            $customImageFileURL = $this->storage->getBucket()->object($firebaseStoragePath)->signedUrl(new \DateTime('3000-01-01T00:00:00Z'));

            $customProductRequestData = [

                'productName' => $originalProductData['productName'],
                'productPrice' => $originalProductData['productPrice'],
                'productImage' => $originalProductData['productImage'],
                'productSize' => 'S',

                'smallQuantity' => $request->smallQnt,
                'mediumQuantity' => $request->mediumQnt,
                'largeQuantity' => $request->largeQnt,
                'extraLargeQuantity' => $request->extraLargeQnt,
                'doubleXLQuantity' => $request->doubleXLQnt,
                'tripleXLQuantity' => $request->tripleXLQnt,
                'productQuantity' => strval($totalCustomizedPrdQnt),

                'associatedOrderID' => 'None',
                'cancelReason' => 'None',
                'cancelReasonNone' => 'None',
                'userCancelReason' => 'None',
                'userCancelReasonAdditional' => 'None',
                'orderStatus' => 'Waiting for Approval',
                'orderType' => $request->orderType == 'default' ? 'default' : 'custom',
                'trackingNumber' => '',
                'orderDateDelivery' => '', //when the order status is updated into out for delivery, this will serve as a reference for enabling receive button
                'paymentDate' => '',

                'recipientName' => $request->recipientName,
                'email' => $request->email,
                'city' => $request->city,
                'barangay' => $request->barangay,
                'addressLine' => $request->address,
                'postalCode' => $request->postalCode,
                'amountToPay' => $request->amountToPay + 100,
                'paymentMethod' => $request->paymentMethod,
                'selectedEWallet' => $request->selectedEwallet,
                'uid' => $request->uid,
                'orderNotes' => $request->orderNotes ? $request->orderNotes : 'None',
                'receiptImage' => 'None',
                'customImage' => $customImageFileURL,

                'orderDate' => Carbon::now()->toDateString(),
                'orderTimeStamp' => Carbon::now('Asia/Manila')->format('h:i A'),
                'updateTimeStamp' => '',

                'fullShippingAddress' => $fullAddress,
                'mobileNumber' => $mobilePhone,

                'isBulkyOrder' => false,
                'isReceived' => false,
                'isRated' => false,
                'isPaid' => false,
                'isNotified' => false
            ];

            //insert into fb db
            $customizationRef = $this->database->getReference('customizedRequest')->push($customProductRequestData);
            $firstOrderKey = $customizationRef->getKey();

            $this->database->getReference('customizedRequest/' . $firstOrderKey)->update([
                'associatedOrderID' => $firstOrderKey
            ]);

            //notify admin
            $this->notifyAdmin(Carbon::now()->toDateString(), Carbon::now('Asia/Manila')->format('h:i A'), 'Place');

            //send email when a customization request has been placed
            $this->sendEmailNotificationForReceipt($firstOrderKey, $email, $firstName, $lastName, Carbon::now()->toDateString(), $request->amountToPay, $mobilePhone, $fullAddress, 'place', null, null);

            // //notify the admin email for placing a request
            // $this->sendEmailNotificationForAdmin($firstOrderKey, $email, $firstName, $lastName, Carbon::now()->toDateString(), $request->amountToPay, $mobilePhone, $fullAddress, 'place', null, null);
        } catch (\Exception $e) {
            return response($e->getMessage());
        }
    }

    //fetching
    public function fetchCustomizationRequestForReceipt($uid, $orderTimeStamp)
    {
        $customizedRequestData = [];
        try {

            if ($this->database->getReference('customizedRequest')->getSnapshot()->exists()) {
                foreach ($this->database->getReference('customizedRequest')->getSnapshot()->getValue() as $customRequestID => $customRequestInfo) {
                    if ($uid == $customRequestInfo['uid'] && $customRequestInfo['orderStatus'] != 'Order Completed' && $customRequestInfo['orderTimeStamp'] == $orderTimeStamp && $customRequestInfo['orderDate'] == Carbon::now()->toDateString()) {
                        $customizedRequestData[] = [
                            'orderID' => $customRequestID,
                            'orderInfo' => $customRequestInfo
                        ];
                    }
                }
            }

            return response()->json($customizedRequestData);
        } catch (\Exception $e) {
            return response($e->getMessage());
        }
    }

    public function fetchMyCustomizationRequests($uid)
    {
        $myCustomizationRequestsData = [];

        try {

            if ($this->database->getReference('customizedRequest')->getSnapshot()->exists()) {
                foreach ($this->database->getReference('customizedRequest')->getSnapshot()->getValue() as $customRequestID => $customRequestInfo) {
                    if ($uid == $customRequestInfo['uid']) {
                        $myCustomizationRequestsData[] = [
                            'orderID' => $customRequestID,
                            'orderInfo' => $customRequestInfo
                        ];
                    }
                }
            }

            return response()->json($myCustomizationRequestsData);
        } catch (\Exception $e) {
            return response($e->getMessage());
        }
    }

    //admin side fetching
    public function fetchCustomizationRequest()
    {
        $customizationRequest = [];

        try {

            if ($this->database->getReference('customizedRequest')->getSnapshot()->exists()) {
                foreach ($this->database->getReference('customizedRequest')->getSnapshot()->getValue() as $customRequestID => $customRequestInfo) {
                    if ($customRequestInfo['orderStatus'] != 'Cancellation Requested') {
                        $customizationRequest[] = [
                            'orderID' => $customRequestID,
                            'orderInfo' => $customRequestInfo
                        ];
                    }
                }
            }

            return response()->json($customizationRequest);
        } catch (\Exception $e) {
            return response($e->getMessage());
        }
    }

    public function fetchCustomizationCancelRequests()
    {
        $cancelCustomizationRequestData = [];
        try {

            if ($this->database->getReference('customizedRequest')->getSnapshot()->exists()) {
                foreach ($this->database->getReference('customizedRequest')->getSnapshot()->getValue() as $customRequestID => $customRequestInfo) {
                    if ($customRequestInfo['orderStatus'] === 'Cancellation Requested') {
                        $cancelCustomizationRequestData[] = [
                            'orderID' => $customRequestID,
                            'orderInfo' => $customRequestInfo
                        ];
                    }
                }
            }

            return response()->json($cancelCustomizationRequestData);
        } catch (\Exception $e) {
            return response($e->getMessage());
        }
    }

    public function fetchCustomizationRequestByDate($dataSortRequest)
    {
        try {

            $customizationData = [];
            if ($this->database->getReference('customizedRequest')->getSnapshot()->exists()) {
                foreach ($this->database->getReference('customizedRequest')->getSnapshot()->getValue() as $requestID => $requestInfo) {
                    if (Carbon::parse($dataSortRequest)->isSameDay(Carbon::parse($requestInfo['orderDate']))) {
                        if ($requestInfo['orderStatus'] != 'Order Completed' && $requestInfo['orderStatus'] != 'Order Cancelled' && $requestInfo['orderStatus'] != 'Request Rejected' && $requestInfo['orderStatus'] != 'Request Cancelled') {
                            $customizationData[] = [
                                'orderID' => $requestID,
                                'orderInfo' => $requestInfo,
                            ];
                        }
                    }
                }
            }
            $message = "No Customized Orders Found!";
            if (count($customizationData) == 0) {
                return response(compact('message'));
            }

            return response()->json($customizationData);
        } catch (\Exception $e) {
            return response($e->getMessage());
        }
    }

    //if custom
    public function cancelCustomizationRequest(Request $request)
    {
        try {

            //will be used as storage to save the customization request data before removing it from the collection
            $customRequestDataToBeMoved = null;
            $updateTimeStamp = Carbon::now('Asia/Manila')->format('h:i A');
            $statusBeforeCancel = "";

            foreach ($this->database->getReference('customizedRequest')->getSnapshot()->getValue() as $customRequestID => $customRequestInfo) {
                if ($request->orderID == $customRequestID) {

                    $statusBeforeCancel = $customRequestInfo['orderStatus'];

                    //check the order status so we can move it automatically if it is still on waiting for approval status
                    if ($customRequestInfo['orderStatus'] === 'Waiting for Approval') {

                        $customRequestDataToBeMoved = $customRequestInfo;

                        //push through the orders collection so we can read it on the transaction / order history
                        $pushedDataRef = $this->database->getReference('orders')->push($customRequestDataToBeMoved);
                        $pushedCustomizationDataKey = $pushedDataRef->getKey();

                        //update the new pushed data in the orders 
                        $this->database->getReference('orders/' . $pushedCustomizationDataKey)->update([
                            'associatedOrderID' => $pushedCustomizationDataKey,
                            'userCancelReason' => $request->reason,
                            'userCancelReasonAdditional' => $request->additionalInformation ? $request->additionalInformation : 'None',
                            'orderStatus' => 'Request Cancelled',
                            'updateTimeStamp' => $updateTimeStamp
                        ]);

                        //delete the request from this collection
                        $this->database->getReference('customizedRequest/' . $customRequestID)->remove();
                    } else {

                        $this->database->getReference('customizedRequest/' . $request->orderID)->update([

                            'statusBeforeCancel' => $statusBeforeCancel,
                            'userCancelReason' => $request->reason,
                            'userCancelReasonAdditional' => $request->additionalInformation ? $request->additionalInformation : 'None',
                            'orderStatus' => 'Cancellation Requested',
                            'updateTimeStamp' => $updateTimeStamp

                        ]);

                        //notify admin through email if sent a cancel request
                        $this->sendEmailNotificationForAdminIfCancelRequest($request->orderID);
                    }
                }
            }

            //notify the admin for cancel request
            $this->notifyAdmin(Carbon::now()->toDateString(), Carbon::now('Asia/Manila')->format('h:i A'), 'Cancel');

            $message = 'Cancellation Request Sent! It will be processed within 2-3 business days.';
            return response(compact('message'));
        } catch (\Exception $e) {
            return response($e->getMessage());
        }
    }

    public function rejectCancelCustomizationRequest(Request $request)
    {
        try {

            $customizationRequest = $this->database->getReference('customizedRequest')->getSnapshot()->getValue();

            // variables for finding the target order
            $targetRequest = null;
            $firstName = '';
            foreach ($customizationRequest as $requestID => $customizationRequestInfo) {
                if ($request->orderID == $requestID) {

                    $targetRequest = $customizationRequestInfo;
                    $firstName = $this->database->getReference('users/' . $customizationRequestInfo['uid'] . '/firstName')->getSnapshot()->getValue();
                    break;
                }
            }

            //loop through the orders again and look for the order with the same timestamp and uid
            foreach ($customizationRequest as $requestID => $customizationRequestInfo) {
                if (($customizationRequestInfo['uid'] == $targetRequest['uid'] && $request->associatedOrderID == $customizationRequestInfo['associatedOrderID'])) {
                    //update the order info
                    $updateRequestInfo = [
                        'orderStatus' => $customizationRequestInfo['statusBeforeCancel'],
                        'statusBeforeCancel' => "None",
                        'userCancelReason' => "None",
                        'userCancelReasonAdditional' => "None",
                        'isRated' => false
                    ];

                    //push the update
                    $this->database->getReference('customizedRequest/' . $requestID)->update($updateRequestInfo);
                }
            }

            // notify the user about the rejection of the cancellation of the request
            $this->notifyUserForCancellationRequestRejection($requestID, $targetRequest['uid']);
            $this->sendEmailForCancelRequestStatus($requestID, $targetRequest['uid'], $targetRequest['email'], 'rejectCancelReq', $firstName);
        } catch (\Exception $e) {

            return response($e->getMessage());
        }
    }

    //updating
    public function updateRequestStatus(Request $request)
    {
        $requestStatus = "";
        $requestStatusType = "";
        $updateTimeStamp = Carbon::now('Asia/Manila')->format('h:i A');

        $orderIDReq = $request->orderID;
        $mobilePhone = '';
        $paymentMethod = '';
        $totalAmountToPay = 0;
        $targetUID = "";

        try {

            foreach ($this->database->getReference('customizedRequest')->getSnapshot()->getValue() as $customRequestID => $customRequestInfo) {
                if ($orderIDReq == $customRequestID) {

                    $mobilePhone = $customRequestInfo['mobileNumber'];
                    $paymentMethod = $customRequestInfo['paymentMethod'];
                    $totalAmountToPay = $customRequestInfo['amountToPay'];
                    $email = $this->database->getReference('users/' . $customRequestInfo['uid'] . '/email')->getSnapshot()->getValue();
                    $firstName = $this->database->getReference('users/' . $customRequestInfo['uid'] . '/firstName')->getSnapshot()->getValue();
                    $lastName = $this->database->getReference('users/' . $customRequestInfo['uid'] . '/lastName')->getSnapshot()->getValue();
                    $fullAddress = $customRequestInfo['fullShippingAddress'];
                    $targetUID = $customRequestInfo['uid'];

                    switch ($request->orderType) {
                        case 'Approve':
                            $requestStatus = "Request Approved";
                            $requestStatusType = "Approve";

                            //send email to user oncr approved
                            $this->sendEmailNotificationForReceipt($customRequestID, $email, $firstName, $lastName, $customRequestInfo['orderDate'], $totalAmountToPay - 100, $mobilePhone, $fullAddress, 'approve', null, null);
                            break;
                        case 'Reject':
                            $requestStatusType = "Reject";
                            $requestStatus = "Request Rejected";

                            //send email to user once admin rejected the request
                            $this->sendEmailNotificationIfAdminRejectOrder($orderIDReq, $email, $firstName, $lastName, $customRequestInfo['orderDate'], $totalAmountToPay - 100, $mobilePhone, $fullAddress, $request->cancelReason, $request->cancelReasonAdditional);

                            //call the reject function to move the req when rejected by the admin
                            $this->moveCustomizationRequestIfCancelledOrRejected($orderIDReq, $request->cancelReason, 'reject', $updateTimeStamp);

                            break;
                        case 'Cancel':
                            $requestStatusType = "Cancel";
                            $requestStatus = "Request Cancelled";

                            //determine if it is a cancellation request approval
                            if ($request->isCancellationRequest) {
                                $this->sendEmailForCancelRequestStatus($orderIDReq, $targetUID, $email, 'cancelReq', $firstName);
                                $this->notifyUserForCancellationRequestApproval($orderIDReq, $targetUID);
                            } else {
                                //send email to user once admin cancelled the request (this is when the admin chose to cancel it based on a given reason such as Inappropriate Design or what...)
                                $this->sentNotificationIfAdminCancelOrder($orderIDReq, $email, $firstName, $lastName, $customRequestInfo['orderDate'], $totalAmountToPay - 100, $mobilePhone, $fullAddress, $request->cancelReason, $request->cancelReasonAdditional);
                            }

                            //call this function again but this time the type is cancelled by the admin
                            $this->moveCustomizationRequestIfCancelledOrRejected($orderIDReq, $request->cancelReason, 'cancel', $updateTimeStamp);

                            break;
                        case 'Prepare':
                            $requestStatus = "Preparing Request to Ship";
                            break;
                        case 'Deliver':
                            $requestStatus = "Parcel out for delivery";
                            break;
                    }

                    if ($requestStatus === 'Parcel out for delivery') {

                        //send SMS to user 
                        $this->notifyUsersForOrderDelivery($mobilePhone, $totalAmountToPay, $request->orderID, $paymentMethod, $targetUID, $request->trackingNumber, $request->estimatedTimeOfDelivery);

                        //send also email to user for delivery notice
                        $this->sendEmailNotificationForReceipt($request->orderID, $email, $firstName, $lastName, Carbon::now()->toDateString(), $totalAmountToPay - 100, $mobilePhone, $fullAddress, 'delivery', $request->trackingNumber, $request->estimatedTimeOfDelivery);

                        //move the data from the customizedRequest collection into the orders collection since out for delivery na siya.
                        $this->moveCustomizationRequestWhenOutForDelivery($request->orderID, $request->estimatedTimeOfDelivery, $request->trackingNumber, $updateTimeStamp);
                    } else if ($requestStatus != 'Request Rejected' && $requestStatus != 'Request Cancelled') {
                        $requestUpdates = [
                            'orderStatus' => $requestStatus,
                            'approvedDate' => Carbon::now()->toDateString(),
                            'updateTimeStamp' => $updateTimeStamp,
                            'cancelReason' => $request->cancelReason ? $request->cancelReason : 'None'
                        ];

                        $this->database->getReference('customizedRequest/' . $customRequestID)->update($requestUpdates);
                    }
                }
            }

            //notify users upon rejection or approve
            $this->notifyUsersCustomizationRequestStatus($updateTimeStamp, $orderIDReq, $targetUID, $requestStatusType);

            $message = 'Request Status Updated';
            return response(compact('message'));
        } catch (\Exception $e) {
            return response($e->getMessage());
        }
    }

    //update the request when user paid
    public function updateRequestWhenPaid(Request $request)
    {
        try {

            $updateTimeStamp = Carbon::now('Asia/Manila')->format('h:i A');
            $mobilePhone = $this->database->getReference('users/' . $request->uid . '/mobileNumber')->getSnapshot()->getValue();
            $email =  $this->database->getReference('users/' . $request->uid . '/email')->getSnapshot()->getValue();
            $firstName =  $this->database->getReference('users/' . $request->uid . '/firstName')->getSnapshot()->getValue();
            $lastName = $this->database->getReference('users/' . $request->uid . '/lastName')->getSnapshot()->getValue();

            foreach ($this->database->getReference('customizedRequest')->getSnapshot()->getValue() as $customRequestID => $customRequestInfo) {
                if ($request->requestID === $customRequestID) {

                    $receiptImageFile = $request->file('receiptFile');
                    $receiptImageName = 'receipts/' . $receiptImageFile->getClientOriginalName();

                    $this->storage->getBucket()->upload($receiptImageFile->getContent(), [
                        'name' => $receiptImageName
                    ]);

                    $fireBaseStoragePath = $receiptImageName;
                    $receiptImageURL = $this->storage->getBucket()->object($fireBaseStoragePath)->signedUrl(new \DateTime('3000-01-01T00:00:00Z'));

                    $updateRequestData = [
                        'isPaid' => true,
                        'paymentDate' => Carbon::now()->toDateString(),
                        'receiptImage' => $receiptImageURL
                    ];

                    $this->database->getReference('customizedRequest/' . $customRequestID)->update($updateRequestData);

                    $this->notifyAdminCustomizationRequestPaymentProcessed($updateTimeStamp, Carbon::now()->toDateString(), $customRequestID);

                    //send an email to the admin
                    $this->sendEmailNotificationForAdminIfRequestPaid($customRequestID);

                    $this->sendEmailNotificationForCustomizationPaymentReceipt($customRequestID, $email, $firstName, $lastName, $customRequestInfo['orderDate'], Carbon::now()->toDateString(), $customRequestInfo['amountToPay'] - 100, $mobilePhone, $customRequestInfo['fullShippingAddress'], $customRequestInfo['selectedEWallet'], $updateTimeStamp);

                    break;
                }
            }

            $message = 'Payment Successful!';
            return response(compact('message'));
        } catch (\Exception $e) {
            return response($e->getMessage());
        }
    }

    // not routed functions
    public function notifyAdmin($dateOrdered, $timeStamp, $type)
    {
        try {

            //loop the db to find the user with a super admin and admin role
            foreach ($this->database->getReference('users')->getSnapshot()->getValue() as $adminID => $adminInfo) {
                if ($adminInfo['role'] == 'superadmin' || $adminInfo['role'] == 'admin') {

                    $notificationData = [
                        'adminID' => $adminID,
                        'notificationMessage' => $type === 'Place' ? 'A customized product request has been submitted' : 'A cancellation request been submitted',
                        'notificationDate' => $dateOrdered,
                        'notificationTime' => $timeStamp,
                        'status' => 'unread'
                    ];

                    $this->database->getReference('notificationForAdmins')->push($notificationData);
                }
            }
        } catch (\Exception $e) {
            return response($e->getMessage());
        }
    }

    public function notifyUsersForOrderDelivery($mobilePhone, $totalAmountToPay, $orderID, $paymentMethod, $uid)
    {
        try {

            //insert into notification node
            $userNotificationData = [
                'notificationMessage' => 'Your parcel customized order ' . $orderID . ' is out for delivery.',
                'notificationDate' => Carbon::now()->toDateString(),
                'notificationTime' => Carbon::now('Asia/Manila')->format('h:i A'),
                'status' => 'unread',
                'uid' => $uid
            ];
            $this->database->getReference('notificationForUsers')->push($userNotificationData);

            //send SMS Notification

            $webClient = new Client();
            $webClient->post('https://semaphore.co/api/v4/messages', [
                'form_params' => [
                    'apikey' => env('SEMAPHORE_API_KEY'),
                    'number' => $mobilePhone,
                    'message' => 'ARFITCHECK: Your parcel with an order ID of ' . $orderID . ' with payment method ' . $paymentMethod . ' ' . $totalAmountToPay . ' PHP is out for delivery. REMINDER: Once you received and accepted the product(s), please confirm it in ARFITCHECK Website by ' . Carbon::now()->addDay(2)->toDateString() . ', if we dont here from you, payment will be automatically transferred to BMIC.',
                    'sendername' => env('SEMAPHORE_SENDER_NAME')
                ]
            ]);
        } catch (\Exception $e) {
            return response($e->getMessage());
        }
    }

    public function notifyUsersCustomizationRequestStatus($timeStamp, $requestID, $uid, $requestStatusType)
    {
        try {

            if (Str::length($requestStatusType) != 0) {

                $notificationStatus =  $requestStatusType == 'Approve' ? 'approved. You may now process your payment for this request.' : ($requestStatusType === 'Cancel' ? 'cancelled.' : 'rejected.');

                $customizedRequestNotificationData = [
                    'notificationDate' => Carbon::now()->toDateString(),
                    'notificationMessage' => 'Your customization request with a request ID ' . $requestID . ' was ' . $notificationStatus,
                    'notificationTime' => $timeStamp,
                    'status' => 'unread',
                    'uid' => $uid
                ];

                $this->database->getReference('notificationForUsers')->push($customizedRequestNotificationData);
            }
        } catch (\Exception $e) {
            return response($e->getMessage());
        }
    }

    public function notifyAdminCustomizationRequestPaymentProcessed($timeStamp, $dataProcessed, $requestID)
    {
        try {

            foreach ($this->database->getReference('users')->getSnapshot()->getValue() as $adminID => $adminInfo) {

                if ($adminInfo['role'] === 'superadmin' || $adminInfo['role'] === 'admin') {
                    $customizedRequestNotificationData = [
                        'adminID' => $adminID,
                        'notificationMessage' => 'User has sucessfully paid the a customization request with an request ID of ' . $requestID,
                        'notificationDate' => $dataProcessed,
                        'notificationTime' => $timeStamp,
                        'status' => 'unread'
                    ];

                    $this->database->getReference('notificationForAdmins')->push($customizedRequestNotificationData);
                }
            }
        } catch (\Exception $e) {
            return response($e->getMessage());
        }
    }


    public function notifyUserForCancellationRequestApproval($orderID, $uid)
    {
        try {

            //insert into notification node
            $userNotificationData = [
                'notificationMessage' => 'Your request to cancel ' . $orderID . ' was approved. Order was moved to order history.',
                'notificationDate' => Carbon::now()->toDateString(),
                'notificationTime' => Carbon::now('Asia/Manila')->format('h:i A'),
                'status' => 'unread',
                'uid' => $uid
            ];
            $this->database->getReference('notificationForUsers')->push($userNotificationData);
        } catch (\Exception $e) {
            return response($e->getMessage());
        }
    }

    public function notifyUserForCancellationRequestRejection($orderID, $uid)
    {
        try {

            //insert into notification node
            $userNotificationData = [
                'notificationMessage' => 'Your request to cancel ' . $orderID . ' was rejected.',
                'notificationDate' => Carbon::now()->toDateString(),
                'notificationTime' => Carbon::now('Asia/Manila')->format('h:i A'),
                'status' => 'unread',
                'uid' => $uid
            ];
            $this->database->getReference('notificationForUsers')->push($userNotificationData);
        } catch (\Exception $e) {
            return response($e->getMessage());
        }
    }

    // EMAIL SHITS
    public function sendEmailNotificationForReceipt($requestID, $email, $firstName, $lastName, $requestDate, $subtotal, $phoneNumber, $fullAddress, $type, $trackingNumber, $estimatedTimeOfDelivery)
    {
        try {

            $status = $type == 'place'
                ? 'has been received by the system. Kindly wait until for the approval of your customization request'
                : ($type == 'approve'
                    ? 'has been approved. You may now also process the payment for this request until ' . Carbon::now()->addDay(2)->toDateString() . ', if you did not process your payment within the set timeframe, your customization request will be automatically cancelled.'
                    : ($type == 'reject'
                        ? 'has been rejected. Your customize request might be over complicated, your design contains inappropriate graphics, etc. For more details, you may contact BMIC on their Facebook.'
                        : ($type == 'cancel'
                            ? 'has been cancelled. Your request will no longer be processed.'
                            : 'is now out for delivery. REMINDER: Once you receive your item(s), please confirm it on the ARFITCHECK Website. If we don’t hear from you, payment will be automatically transferred to BMIC.'
                        )
                    )
                );

            $subjectStatus = $type == 'place'
                ? 'has been received by the system.'
                : ($type == 'approve'
                    ? 'has been approved.'
                    : ($type == 'reject'
                        ? 'has been rejected.'
                        : ($type == 'cancel'
                            ? 'has been cancelled.'
                            : 'is now out for delivery.'
                        )
                    )
                );

            $estTimeManipulator = $estimatedTimeOfDelivery === 1 ? '1 - 2' : ($estimatedTimeOfDelivery === 2 ? '2 - 3' : ($estimatedTimeOfDelivery === 3 ? '3 - 4' : ($estimatedTimeOfDelivery === 4 ? '4 - 5' : '5+')));

            $emailNotificationData = [
                'subject' => 'Your customized request ' . $requestID . ' ' . $subjectStatus,
                'email' =>  $email,
                'status' => $status,
                'requestID' => $requestID,
                'requestDate' => $requestDate,
                'subtotal' => $subtotal,
                'phoneNumber' => $phoneNumber,
                'fullAddress' => $fullAddress,
                'recipient' => $firstName,
                'recipientLN' => $lastName,
                'trackingNumber' => $trackingNumber != null ? $trackingNumber : '-',
                'estimatedTimeOfDelivery' => $estimatedTimeOfDelivery != null ? $estTimeManipulator : '-',
                'url' => 'https://storage.googleapis.com/arfit-check-db.appspot.com/profiles/Logo.jpg?GoogleAccessId=firebase-adminsdk-j3jm3%40arfit-check-db.iam.gserviceaccount.com&Expires=32503680000&Signature=o36PEVjY2zvydUEoAeFWI9MOQ04aDVm4TjyvvvY%2FfZx1%2FargqQHKBWR6kFtOLYjLFuscTO0sYYdEBgL3uJ%2FQDCk1FwieZUdulfK9RcRX2dw9DzeiUFOv3IgilHC6lM3J44or8Hefi2QnmZddVv2CayI4BMOzUvHREhP1rVEuKSwJ0Px2e6wfg3HR7F9pcf0CYm93SpsCfP9NAtWUXUSFHKiFBHzxFDMmWgcBGWpOxbPgNgp%2FZGx9GSsZMw3Wu8Mfzx10iQv%2Fa7B4CGgpLCITPgIA30jFYw4x%2FdeCoW9UEkI2Iei1fqn2IiBWPLlurv526oVcuvdJMsVGfN1nK%2FMLNA%3D%3D'
            ];

            Mail::send([], [], function ($message) use ($emailNotificationData) {
                $htmlBody = '
                <html>
                    <head>
                    <style>
                        body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        padding: 20px;
                        }
                        .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #ffffff;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                        }
                        h1, h2, h3 {
                        color: #333333;
                        }
                        p {
                        color: #555555;
                        line-height: 1.6;
                        }
                        .divider {
                        border-top: 1px solid #dddddd;
                        margin: 20px 0;
                        }
                        .order-id {
                        font-weight: bold;
                        }
                        .footer {
                        margin-top: 20px;
                        text-align: center;
                        color: #888888;
                        font-size: 12px;
                        }
                        .logo {
                        text-align: center;
                        margin-bottom: 20px;
                        }
                        .logo img {
                        max-width: 100px; /* Adjust the size of the image */
                        }
                    </style>
                    </head>
                    <body>
                    <div class="container">
                        <div class="logo">
                        <img src="' . $emailNotificationData['url'] . '" alt="Logo" style="width: 200px; height: auto;">
                        </div>
                        
                        <p>Hi ' . $emailNotificationData['recipient'] . ',</p>
                        <p>Your customization request with an request ID of <span class="order-id">' . $emailNotificationData['requestID'] . '</span> ' . $emailNotificationData['status'] . '</p>
                        
                        <div class="divider"></div>
                
                        <h3>REQUEST DETAILS</h3>
                        <p><strong>Request ID:</strong> ' . $emailNotificationData['requestID'] . '</p>
                        <p><strong>Request Date:</strong> ' . $emailNotificationData['requestDate'] . '</p>
                        
                        <div class="divider"></div>
                
                        <p><strong>Subtotal:</strong> P' . $emailNotificationData['subtotal'] . '</p>
                        <p><strong>Shipping Fee:</strong> P100</p>
                        <p><strong>Total Payment:</strong> P' . ($emailNotificationData['subtotal'] + 100) . '</p>
                
                        <div class="divider"></div>
                
                        <h3>DELIVERY DETAILS</h3>
                        <p><strong>Recipient Name:</strong> ' . $emailNotificationData['recipient'] . ' ' . $emailNotificationData['recipientLN'] . '</p>
                        <p><strong>Phone Number:</strong> ' . $emailNotificationData['phoneNumber'] . '</p>
                        <p><strong>Shipping Address:</strong> ' . $emailNotificationData['fullAddress'] . '</p>
                        <p><strong>Tracking Number:</strong> ' . $emailNotificationData['trackingNumber'] . '</p>
                        <p><strong>Estimated Hrs. of Delivery:</strong> ' . $emailNotificationData['estimatedTimeOfDelivery'] . ' hr(s)</p>
                
                        <div class="divider"></div>
                
                        <h3>WHAT\'S NEXT</h3>
                        <p>Kindly wait for BMIC to process your request, if your customization request was approved you will be notified in app and email, you have 2 days to process the payment. If we didnt here from you, your customization request will be cancelled. </p>

                        <p>If your customization request has been rejected, it might be due to the following reasons, over complicated design, your design contains inappropriate graphics, etc. For more details, you may contact BMIC on their Facebook. </p>

                        <p>Once you process your payment kindly wait for your shipment. Once your receive and accept the product(s), kindly confirm this in ARFITCHECK Web. </p>

                         <p>
                            <a href="https://www.facebook.com/bmic.clothing" target="_blank">Visit BMIC on Facebook</a>
                        </p>
                    </div>
                
                    <div class="footer">
                        <p>&copy; ' . date('Y') . ' ARFITCHECK. All rights reserved.</p>
                    </div>
                    </body>
                </html>
                ';

                $message->from(env('MAIL_FROM_ADDRESS'), env('MAIL_FROM_NAME'));
                $message->to($emailNotificationData['email'])
                    ->subject($emailNotificationData['subject'])
                    ->html($htmlBody);
            });

            return response()->json([
                'message' => 'Email sent successfully!'
            ]);
        } catch (\Exception $e) {
            return response($e->getMessage());
        }
    }

    public function sendEmailNotificationForCustomizationPaymentReceipt($requestID, $email, $firstName, $lastName, $requestDate, $paymentDate, $subtotal, $phoneNumber, $fullAddress, $selectedEWallet, $timeStamp)
    {
        try {

            $emailNotificationData = [
                'subject' => 'Successfully Paid Customization Request ' . $requestID,
                'email' =>  $email,
                'requestID' => $requestID,
                'requestDate' => $requestDate,
                'paymentDate' => $paymentDate,
                'paymentMethod' => 'E-Wallet',
                'ewallet' => $selectedEWallet === 'gcash' ? 'G-Cash' : 'Paymaya',
                'timeStamp' => $timeStamp,
                'subtotal' => $subtotal,
                'phoneNumber' => $phoneNumber,
                'fullAddress' => $fullAddress,
                'recipient' => $firstName,
                'recipientLN' => $lastName,
                'url' => 'https://storage.googleapis.com/arfit-check-db.appspot.com/profiles/Logo.jpg?GoogleAccessId=firebase-adminsdk-j3jm3%40arfit-check-db.iam.gserviceaccount.com&Expires=32503680000&Signature=o36PEVjY2zvydUEoAeFWI9MOQ04aDVm4TjyvvvY%2FfZx1%2FargqQHKBWR6kFtOLYjLFuscTO0sYYdEBgL3uJ%2FQDCk1FwieZUdulfK9RcRX2dw9DzeiUFOv3IgilHC6lM3J44or8Hefi2QnmZddVv2CayI4BMOzUvHREhP1rVEuKSwJ0Px2e6wfg3HR7F9pcf0CYm93SpsCfP9NAtWUXUSFHKiFBHzxFDMmWgcBGWpOxbPgNgp%2FZGx9GSsZMw3Wu8Mfzx10iQv%2Fa7B4CGgpLCITPgIA30jFYw4x%2FdeCoW9UEkI2Iei1fqn2IiBWPLlurv526oVcuvdJMsVGfN1nK%2FMLNA%3D%3D'
            ];

            Mail::send([], [], function ($message) use ($emailNotificationData) {
                $htmlBody = '
                <html>
                    <head>
                    <style>
                        body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        padding: 20px;
                        }
                        .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #ffffff;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                        }
                        h1, h2, h3 {
                        color: #333333;
                        }
                        p {
                        color: #555555;
                        line-height: 1.6;
                        }
                        .divider {
                        border-top: 1px solid #dddddd;
                        margin: 20px 0;
                        }
                        .order-id {
                        font-weight: bold;
                        }
                        .footer {
                        margin-top: 20px;
                        text-align: center;
                        color: #888888;
                        font-size: 12px;
                        }
                        .logo {
                        text-align: center;
                        margin-bottom: 20px;
                        }
                        .logo img {
                        max-width: 100px; /* Adjust the size of the image */
                        }
                    </style>
                    </head>
                    <body>
                    <div class="container">
                        <div class="logo">
                        <img src="' . $emailNotificationData['url'] . '" alt="Logo" style="width: 200px; height: auto;">
                        </div>
                        
                        <p>Hi ' . $emailNotificationData['recipient'] . ',</p>
                        <p>You have succesfully sent the payment for your customization request with a request ID of <span class="order-id">' . $emailNotificationData['requestID'] . '</span>.</p>
                        
                        <div class="divider"></div>
                
                        <h3>REQUEST DETAILS</h3>
                        <p><strong>Request ID:</strong> ' . $emailNotificationData['requestID'] . '</p>
                        <p><strong>Request Date:</strong> ' . $emailNotificationData['requestDate'] . '</p>
                       
                        <div class="divider"></div>

                        <h3>PAYMENT DETAILS</h3>
                        <p><strong>Payment Date & Time:</strong> ' . $emailNotificationData['paymentDate'] . ' ' . $emailNotificationData['timeStamp'] . '</p>
                        <p><strong>Payment Method:</strong> ' . $emailNotificationData['paymentMethod'] . ' (' . $emailNotificationData['ewallet'] . ')</p>
                
                        <div class="divider"></div>

                        <p><strong>Subtotal:</strong> P' . $emailNotificationData['subtotal'] . '</p>
                        <p><strong>Shipping Fee:</strong> P100</p>
                        <p><strong>Total Payment:</strong> P' . ($emailNotificationData['subtotal'] + 100) . '</p>
                
                        <div class="divider"></div>
                
                        <h3>WHAT\'S NEXT</h3>
                        <p>Kindly wait for BMIC to process your request, if your customization request was approved you will be notified in app and email, you have 2 days to process the payment. If we didnt here from you, your customization request will be cancelled. </p>

                        <p>If your customization request has been rejected, it might be due to the following reasons, over complicated design, your design contains inappropriate graphics, etc. For more details, you may contact BMIC on their Facebook. </p>

                        <p>Once you process your payment kindly wait for your shipment. Once your receive and accept the product(s), kindly confirm this in ARFITCHECK Web. </p>

                         <p>
                            <a href="https://www.facebook.com/bmic.clothing" target="_blank">Visit BMIC on Facebook</a>
                        </p>
                    </div>
                
                    <div class="footer">
                        <p>&copy; ' . date('Y') . ' ARFITCHECK. All rights reserved.</p>
                    </div>
                    </body>
                </html>
                ';

                $message->from(env('MAIL_FROM_ADDRESS'), env('MAIL_FROM_NAME'));
                $message->to($emailNotificationData['email'])
                    ->subject($emailNotificationData['subject'])
                    ->html($htmlBody);
            });

            return response()->json([
                'message' => 'Email sent successfully!'
            ]);
        } catch (\Exception $e) {
            return response($e->getMessage());
        }
    }

    public function sentNotificationIfAdminCancelOrder($orderID, $email, $firstName, $lastName, $orderDate, $subtotal, $phoneNumber, $fullAddress, $cancelReason, $cancelReasonAdditional)
    {
        try {

            $emailNotificationData = [
                'subject' => 'Your customization request ' . $orderID . ' ' . 'has been cancelled.',
                'email' =>  $email,
                'status' => 'has been cancelled due to the following reason, "' . $cancelReason . '".',
                'cancelReason' => $cancelReason,
                'cancelReasongAdditional' => $cancelReasonAdditional != null ? $cancelReasonAdditional : '-',
                'orderID' => $orderID,
                'orderDate' => $orderDate,
                'subtotal' => $subtotal,
                'phoneNumber' => $phoneNumber,
                'fullAddress' => $fullAddress,
                'recipient' => $firstName,
                'recipientLN' => $lastName,
                'url' => 'https://storage.googleapis.com/arfit-check-db.appspot.com/profiles/Logo.jpg?GoogleAccessId=firebase-adminsdk-j3jm3%40arfit-check-db.iam.gserviceaccount.com&Expires=32503680000&Signature=o36PEVjY2zvydUEoAeFWI9MOQ04aDVm4TjyvvvY%2FfZx1%2FargqQHKBWR6kFtOLYjLFuscTO0sYYdEBgL3uJ%2FQDCk1FwieZUdulfK9RcRX2dw9DzeiUFOv3IgilHC6lM3J44or8Hefi2QnmZddVv2CayI4BMOzUvHREhP1rVEuKSwJ0Px2e6wfg3HR7F9pcf0CYm93SpsCfP9NAtWUXUSFHKiFBHzxFDMmWgcBGWpOxbPgNgp%2FZGx9GSsZMw3Wu8Mfzx10iQv%2Fa7B4CGgpLCITPgIA30jFYw4x%2FdeCoW9UEkI2Iei1fqn2IiBWPLlurv526oVcuvdJMsVGfN1nK%2FMLNA%3D%3D'
            ];

            Mail::send([], [], function ($message) use ($emailNotificationData) {
                $htmlBody = '
           <html>
             <head>
               <style>
                 body {
                   font-family: Arial, sans-serif;
                   background-color: #f4f4f4;
                   padding: 20px;
                 }
                 .container {
                   max-width: 600px;
                   margin: 0 auto;
                   background-color: #ffffff;
                   padding: 20px;
                   border-radius: 8px;
                   box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                 }
                 h1, h2, h3 {
                   color: #333333;
                 }
                 p {
                   color: #555555;
                   line-height: 1.6;
                 }
                 .divider {
                   border-top: 1px solid #dddddd;
                   margin: 20px 0;
                 }
                 .order-id {
                   font-weight: bold;
                 }
                 .footer {
                   margin-top: 20px;
                   text-align: center;
                   color: #888888;
                   font-size: 12px;
                 }
                 .logo {
                   text-align: center;
                   margin-bottom: 20px;
                 }
                 .logo img {
                   max-width: 100px;
                 }
               </style>
             </head>
             <body>
               <div class="container">
                 <div class="logo">
                   <img src="' . $emailNotificationData['url'] . '" alt="Logo" style="width: 200px; height: auto;">
                 </div>
                 
                 <p>Hi ' . $emailNotificationData['recipient'] . ',</p>
                 <p>Your customization request with an order ID of <span class="order-id">' . $emailNotificationData['orderID'] . '</span> ' . $emailNotificationData['status'] . '</p>
                 
                 <div class="divider"></div>
           
                 <h3>REQUEST DETAILS</h3>
                 <p><strong>Request ID:</strong> ' . $emailNotificationData['orderID'] . '</p>
                 <p><strong>Request Date:</strong> ' . $emailNotificationData['orderDate'] . '</p>
                 
                 <div class="divider"></div>
           
                 <p><strong>Reason for Cancellation:</strong> ' . $emailNotificationData['cancelReason'] . '</p>
                 <p><strong>Additional Information:</strong> ' . $emailNotificationData['cancelReasongAdditional'] . '</p>
  
                 <div class="divider"></div>
           
                 <h3>WHAT\'S NEXT</h3>
                 <p>For more details, you may contact BMIC on their Facebook page.</p>
                 <p>
                  <a href="https://www.facebook.com/bmic.clothing" target="_blank">Visit BMIC on Facebook</a>
                </p>
               </div>
           
               <div class="footer">
                 <p>&copy; ' . date('Y') . ' ARFITCHECK. All rights reserved.</p>
               </div>
             </body>
           </html>
           ';

                $message->from(env('MAIL_FROM_ADDRESS'), env('MAIL_FROM_NAME'));
                $message->to($emailNotificationData['email'])
                    ->subject($emailNotificationData['subject'])
                    ->html($htmlBody);
            });

            return response()->json([
                'message' => 'Email sent to ' . $email . '.'
            ], 200);
        } catch (\Exception $e) {
            return response($e->getMessage());
        }
    }

    public function sendEmailNotificationIfAdminRejectOrder($orderID, $email, $firstName, $lastName, $orderDate, $subtotal, $phoneNumber, $fullAddress, $cancelReason, $cancelReasonAdditional)
    {
        try {

            $emailNotificationData = [
                'subject' => 'Your customization request ' . $orderID . ' ' . 'has been rejected.',
                'email' =>  $email,
                'status' => 'has been rejected due to the following reason, "' . $cancelReason . '".',
                'cancelReason' => $cancelReason,
                'cancelReasongAdditional' => $cancelReasonAdditional != null ? $cancelReasonAdditional : '-',
                'orderID' => $orderID,
                'orderDate' => $orderDate,
                'subtotal' => $subtotal,
                'phoneNumber' => $phoneNumber,
                'fullAddress' => $fullAddress,
                'recipient' => $firstName,
                'recipientLN' => $lastName,
                'url' => 'https://storage.googleapis.com/arfit-check-db.appspot.com/profiles/Logo.jpg?GoogleAccessId=firebase-adminsdk-j3jm3%40arfit-check-db.iam.gserviceaccount.com&Expires=32503680000&Signature=o36PEVjY2zvydUEoAeFWI9MOQ04aDVm4TjyvvvY%2FfZx1%2FargqQHKBWR6kFtOLYjLFuscTO0sYYdEBgL3uJ%2FQDCk1FwieZUdulfK9RcRX2dw9DzeiUFOv3IgilHC6lM3J44or8Hefi2QnmZddVv2CayI4BMOzUvHREhP1rVEuKSwJ0Px2e6wfg3HR7F9pcf0CYm93SpsCfP9NAtWUXUSFHKiFBHzxFDMmWgcBGWpOxbPgNgp%2FZGx9GSsZMw3Wu8Mfzx10iQv%2Fa7B4CGgpLCITPgIA30jFYw4x%2FdeCoW9UEkI2Iei1fqn2IiBWPLlurv526oVcuvdJMsVGfN1nK%2FMLNA%3D%3D'
            ];

            Mail::send([], [], function ($message) use ($emailNotificationData) {
                $htmlBody = '
           <html>
             <head>
               <style>
                 body {
                   font-family: Arial, sans-serif;
                   background-color: #f4f4f4;
                   padding: 20px;
                 }
                 .container {
                   max-width: 600px;
                   margin: 0 auto;
                   background-color: #ffffff;
                   padding: 20px;
                   border-radius: 8px;
                   box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                 }
                 h1, h2, h3 {
                   color: #333333;
                 }
                 p {
                   color: #555555;
                   line-height: 1.6;
                 }
                 .divider {
                   border-top: 1px solid #dddddd;
                   margin: 20px 0;
                 }
                 .order-id {
                   font-weight: bold;
                 }
                 .footer {
                   margin-top: 20px;
                   text-align: center;
                   color: #888888;
                   font-size: 12px;
                 }
                 .logo {
                   text-align: center;
                   margin-bottom: 20px;
                 }
                 .logo img {
                   max-width: 100px;
                 }
               </style>
             </head>
             <body>
               <div class="container">
                 <div class="logo">
                   <img src="' . $emailNotificationData['url'] . '" alt="Logo" style="width: 200px; height: auto;">
                 </div>
                 
                 <p>Hi ' . $emailNotificationData['recipient'] . ',</p>
                 <p>Your customization request with an order ID of <span class="order-id">' . $emailNotificationData['orderID'] . '</span> ' . $emailNotificationData['status'] . '</p>
                 
                 <div class="divider"></div>
           
                 <h3>REQUEST DETAILS</h3>
                 <p><strong>Request ID:</strong> ' . $emailNotificationData['orderID'] . '</p>
                 <p><strong>Request Date:</strong> ' . $emailNotificationData['orderDate'] . '</p>
                 
                 <div class="divider"></div>
           
                 <p><strong>Reason for Cancellation:</strong> ' . $emailNotificationData['cancelReason'] . '</p>
                 <p><strong>Additional Information:</strong> ' . $emailNotificationData['cancelReasongAdditional'] . '</p>
  
                 <div class="divider"></div>
           
                 <h3>WHAT\'S NEXT</h3>
                 <p>For more details, you may contact BMIC on their Facebook page.</p>
                 <p>
                  <a href="https://www.facebook.com/bmic.clothing" target="_blank">Visit BMIC on Facebook</a>
                </p>
               </div>
           
               <div class="footer">
                 <p>&copy; ' . date('Y') . ' ARFITCHECK. All rights reserved.</p>
               </div>
             </body>
           </html>
           ';

                $message->from(env('MAIL_FROM_ADDRESS'), env('MAIL_FROM_NAME'));
                $message->to($emailNotificationData['email'])
                    ->subject($emailNotificationData['subject'])
                    ->html($htmlBody);
            });

            return response()->json([
                'message' => 'Email sent to ' . $email . '.'
            ], 200);
        } catch (\Exception $e) {
            return response($e->getMessage());
        }
    }

    public function sendEmailForCancelRequestStatus($orderID, $uid, $email, $type, $recipient)
    {
        try {

            $status = $type === 'rejectCancelReq' ? 'was rejected. customization request goes back to its original status.' : 'was approved. Your customization request has been moved to order history.';

            $emailNotificationData = [
                'subject' => 'Your customization request ' . $orderID . ' cancellation update.',
                'email' =>  $email,
                'status' => $status,
                'orderID' => $orderID,
                'recipient' => $recipient,
                'uid' => $uid,
                'url' => 'https://storage.googleapis.com/arfit-check-db.appspot.com/profiles/Logo.jpg?GoogleAccessId=firebase-adminsdk-j3jm3%40arfit-check-db.iam.gserviceaccount.com&Expires=32503680000&Signature=o36PEVjY2zvydUEoAeFWI9MOQ04aDVm4TjyvvvY%2FfZx1%2FargqQHKBWR6kFtOLYjLFuscTO0sYYdEBgL3uJ%2FQDCk1FwieZUdulfK9RcRX2dw9DzeiUFOv3IgilHC6lM3J44or8Hefi2QnmZddVv2CayI4BMOzUvHREhP1rVEuKSwJ0Px2e6wfg3HR7F9pcf0CYm93SpsCfP9NAtWUXUSFHKiFBHzxFDMmWgcBGWpOxbPgNgp%2FZGx9GSsZMw3Wu8Mfzx10iQv%2Fa7B4CGgpLCITPgIA30jFYw4x%2FdeCoW9UEkI2Iei1fqn2IiBWPLlurv526oVcuvdJMsVGfN1nK%2FMLNA%3D%3D'
            ];

            Mail::send([], [], function ($message) use ($emailNotificationData) {
                $htmlBody = '
             <html>
               <head>
                 <style>
                   body {
                     font-family: Arial, sans-serif;
                     background-color: #f4f4f4;
                     padding: 20px;
                   }
                   .container {
                     max-width: 600px;
                     margin: 0 auto;
                     background-color: #ffffff;
                     padding: 20px;
                     border-radius: 8px;
                     box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                   }
                   h1, h2, h3 {
                     color: #333333;
                   }
                   p {
                     color: #555555;
                     line-height: 1.6;
                   }
                   .divider {
                     border-top: 1px solid #dddddd;
                     margin: 20px 0;
                   }
                   .order-id {
                     font-weight: bold;
                   }
                   .footer {
                     margin-top: 20px;
                     text-align: center;
                     color: #888888;
                     font-size: 12px;
                   }
                   .logo {
                     text-align: center;
                     margin-bottom: 20px;
                   }
                   .logo img {
                     max-width: 100px; /* Adjust the size of the image */
                   }
                 </style>
               </head>
               <body>
                 <div class="container">
                   <div class="logo">
                     <img src="' . $emailNotificationData['url'] . '" alt="Logo" style="width: 200px; height: auto;">
                   </div>
                   
                   <p>Hi ' . $emailNotificationData['recipient'] . ',</p>
                   <p>Your request to cancel <span class="order-id">' . $emailNotificationData['orderID'] . '</span> ' . $emailNotificationData['status'] . ' </p>
                   
                   <div class="divider"></div>
             
                   <p>
                    <a href="https://www.facebook.com/bmic.clothing" target="_blank">Visit BMIC on Facebook</a>
                  </p>
                 </div>
             
                 <div class="footer">
                   <p>&copy; ' . date('Y') . ' ARFITCHECK. All rights reserved.</p>
                 </div>
               </body>
             </html>
             ';

                $message->from(env('MAIL_FROM_ADDRESS'), env('MAIL_FROM_NAME'));
                $message->to($emailNotificationData['email'])
                    ->subject($emailNotificationData['subject'])
                    ->html($htmlBody);
            });

            return response()->json([
                'message' => 'Email sent to ' . $email . '.'
            ], 200);
        } catch (\Exception $e) {
            return response($e->getMessage());
        }
    }

    //NOTIFY THE ADMIN IF THE CUSTOMIZATION REQUEST HAS BEEN PAID BY THE USER
    public function sendEmailNotificationForAdminIfRequestPaid($requestID)
    {
        try {

            $emailNotificationData = [
                'subject' => 'A customization request ' . $requestID . ' was paid.',
                'paymentDate' => Carbon::now()->toDateString(),
                'requestID' => $requestID,
                'paymentMethod' => 'E-Wallet',
                'email' =>  'bmicclothes@gmail.com',
                'url' => 'https://storage.googleapis.com/arfit-check-db.appspot.com/profiles/Logo.jpg?GoogleAccessId=firebase-adminsdk-j3jm3%40arfit-check-db.iam.gserviceaccount.com&Expires=32503680000&Signature=o36PEVjY2zvydUEoAeFWI9MOQ04aDVm4TjyvvvY%2FfZx1%2FargqQHKBWR6kFtOLYjLFuscTO0sYYdEBgL3uJ%2FQDCk1FwieZUdulfK9RcRX2dw9DzeiUFOv3IgilHC6lM3J44or8Hefi2QnmZddVv2CayI4BMOzUvHREhP1rVEuKSwJ0Px2e6wfg3HR7F9pcf0CYm93SpsCfP9NAtWUXUSFHKiFBHzxFDMmWgcBGWpOxbPgNgp%2FZGx9GSsZMw3Wu8Mfzx10iQv%2Fa7B4CGgpLCITPgIA30jFYw4x%2FdeCoW9UEkI2Iei1fqn2IiBWPLlurv526oVcuvdJMsVGfN1nK%2FMLNA%3D%3D'
            ];

            Mail::send([], [], function ($message) use ($emailNotificationData) {
                $htmlBody = '
                <html>
                    <head>
                    <style>
                        body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        padding: 20px;
                        }
                        .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #ffffff;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                        }
                        h1, h2, h3 {
                        color: #333333;
                        }
                        p {
                        color: #555555;
                        line-height: 1.6;
                        }
                        .divider {
                        border-top: 1px solid #dddddd;
                        margin: 20px 0;
                        }
                        .order-id {
                        font-weight: bold;
                        }
                        .footer {
                        margin-top: 20px;
                        text-align: center;
                        color: #888888;
                        font-size: 12px;
                        }
                        .logo {
                        text-align: center;
                        margin-bottom: 20px;
                        }
                        .logo img {
                        max-width: 100px; /* Adjust the size of the image */
                        }
                    </style>
                    </head>
                    <body>
                    <div class="container">
                        <div class="logo">
                        <img src="' . $emailNotificationData['url'] . '" alt="Logo" style="width: 200px; height: auto;">
                        </div>
                        
                        <p>A customization request with an request ID of <span class="order-id">' . $emailNotificationData['requestID'] . '</span> has been paid by the user. 
                        
                        <div class="divider"></div>

                        <h3>REQUEST DETAILS</h3>
                        <p><strong>Request ID:</strong> ' . $emailNotificationData['requestID'] . '</p>
                        <p><strong>Payment date:</strong> ' . $emailNotificationData['paymentDate'] . '</p>
                        <p><strong>Method:</strong> ' . $emailNotificationData['paymentMethod'] . '</p>
                        
                        <div class="divider"></div>
                         <p>
                            <a href="https://www.facebook.com/bmic.clothing" target="_blank">Visit BMIC on Facebook</a>
                        </p>
                    <div class="footer">
                        <p>&copy; ' . date('Y') . ' ARFITCHECK. All rights reserved.</p>
                    </div>
                    </body>
                </html>
                ';

                $message->from(env('MAIL_FROM_ADDRESS'), env('MAIL_FROM_NAME'));
                $message->to($emailNotificationData['email'])
                    ->subject($emailNotificationData['subject'])
                    ->html($htmlBody);
            });

            return response()->json([
                'message' => 'Email sent successfully!'
            ]);
        } catch (\Exception $e) {
            return response($e->getMessage());
        }
    }


    public function sendEmailNotificationForAdminIfCancelRequest($requestID)
    {
        try {

            $emailNotificationData = [
                'subject' => 'A customer requested to cancel a customization request with request ID ' . $requestID . '.',
                'paymentDate' => Carbon::now()->toDateString(),
                'requestID' => $requestID,
                'paymentMethod' => 'E-Wallet',
                'email' =>  'bmicclothes@gmail.com',
                'url' => 'https://storage.googleapis.com/arfit-check-db.appspot.com/profiles/Logo.jpg?GoogleAccessId=firebase-adminsdk-j3jm3%40arfit-check-db.iam.gserviceaccount.com&Expires=32503680000&Signature=o36PEVjY2zvydUEoAeFWI9MOQ04aDVm4TjyvvvY%2FfZx1%2FargqQHKBWR6kFtOLYjLFuscTO0sYYdEBgL3uJ%2FQDCk1FwieZUdulfK9RcRX2dw9DzeiUFOv3IgilHC6lM3J44or8Hefi2QnmZddVv2CayI4BMOzUvHREhP1rVEuKSwJ0Px2e6wfg3HR7F9pcf0CYm93SpsCfP9NAtWUXUSFHKiFBHzxFDMmWgcBGWpOxbPgNgp%2FZGx9GSsZMw3Wu8Mfzx10iQv%2Fa7B4CGgpLCITPgIA30jFYw4x%2FdeCoW9UEkI2Iei1fqn2IiBWPLlurv526oVcuvdJMsVGfN1nK%2FMLNA%3D%3D'
            ];

            Mail::send([], [], function ($message) use ($emailNotificationData) {
                $htmlBody = '
                <html>
                    <head>
                    <style>
                        body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        padding: 20px;
                        }
                        .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #ffffff;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                        }
                        h1, h2, h3 {
                        color: #333333;
                        }
                        p {
                        color: #555555;
                        line-height: 1.6;
                        }
                        .divider {
                        border-top: 1px solid #dddddd;
                        margin: 20px 0;
                        }
                        .order-id {
                        font-weight: bold;
                        }
                        .footer {
                        margin-top: 20px;
                        text-align: center;
                        color: #888888;
                        font-size: 12px;
                        }
                        .logo {
                        text-align: center;
                        margin-bottom: 20px;
                        }
                        .logo img {
                        max-width: 100px; /* Adjust the size of the image */
                        }
                    </style>
                    </head>
                    <body>
                    <div class="container">
                        <div class="logo">
                        <img src="' . $emailNotificationData['url'] . '" alt="Logo" style="width: 200px; height: auto;">
                        </div>
                        
                        <p>A customer requested to cancel a customization request with an request ID of <span class="order-id">' . $emailNotificationData['requestID'] . '</span>. 
                        
                        <div class="divider"></div>
                         <p>
                            <a href="https://www.facebook.com/bmic.clothing" target="_blank">Visit BMIC on Facebook</a>
                        </p>
                    <div class="footer">
                        <p>&copy; ' . date('Y') . ' ARFITCHECK. All rights reserved.</p>
                    </div>
                    </body>
                </html>
                ';

                $message->from(env('MAIL_FROM_ADDRESS'), env('MAIL_FROM_NAME'));
                $message->to($emailNotificationData['email'])
                    ->subject($emailNotificationData['subject'])
                    ->html($htmlBody);
            });

            return response()->json([
                'message' => 'Email sent successfully!'
            ]);
        } catch (\Exception $e) {
            return response($e->getMessage());
        }
    }

    public function sendEmailNotificationForAdmin($requestID, $email, $firstName, $lastName, $requestDate, $subtotal, $phoneNumber, $fullAddress, $type, $trackingNumber, $estimatedTimeOfDelivery)
    {
        try {

            $status = $type == 'place'
                ? 'a customization request has been placed.'
                : ($type == 'approve'
                    ? 'has been approved. You may now also process the payment for this request until ' . Carbon::now()->addDay(2)->toDateString() . ', if you did not process your payment within the set timeframe, your customization request will be automatically cancelled.'
                    : ($type == 'reject'
                        ? 'has been rejected. Your customize request might be over complicated, your design contains inappropriate graphics, etc. For more details, you may contact BMIC on their Facebook.'
                        : ($type == 'cancel'
                            ? 'has been cancelled. Your request will no longer be processed.'
                            : 'is now out for delivery. REMINDER: Once you receive your item(s), please confirm it on the ARFITCHECK Website. If we don’t hear from you, payment will be automatically transferred to BMIC.'
                        )
                    )
                );

            $subjectStatus = $type == 'place'
                ? 'has been placed.'
                : ($type == 'approve'
                    ? 'has been approved.'
                    : ($type == 'reject'
                        ? 'has been rejected.'
                        : ($type == 'cancel'
                            ? 'has been cancelled.'
                            : 'is now out for delivery.'
                        )
                    )
                );

            $estTimeManipulator = $estimatedTimeOfDelivery === 1 ? '1 - 2' : ($estimatedTimeOfDelivery === 2 ? '2 - 3' : ($estimatedTimeOfDelivery === 3 ? '3 - 4' : ($estimatedTimeOfDelivery === 4 ? '4 - 5' : '5+')));

            $emailNotificationData = [
                'subject' => 'A customization request with a request ID ' . $requestID . ' ' . $subjectStatus,
                'email' =>  'bmicclothes@gmail.com',
                'status' => $status,
                'requestID' => $requestID,
                'requestDate' => $requestDate,
                'subtotal' => $subtotal,
                'phoneNumber' => $phoneNumber,
                'fullAddress' => $fullAddress,
                'recipient' => $firstName,
                'recipientLN' => $lastName,
                'trackingNumber' => $trackingNumber != null ? $trackingNumber : '-',
                'estimatedTimeOfDelivery' => $estimatedTimeOfDelivery != null ? $estTimeManipulator : '-',
                'url' => 'https://storage.googleapis.com/arfit-check-db.appspot.com/profiles/Logo.jpg?GoogleAccessId=firebase-adminsdk-j3jm3%40arfit-check-db.iam.gserviceaccount.com&Expires=32503680000&Signature=o36PEVjY2zvydUEoAeFWI9MOQ04aDVm4TjyvvvY%2FfZx1%2FargqQHKBWR6kFtOLYjLFuscTO0sYYdEBgL3uJ%2FQDCk1FwieZUdulfK9RcRX2dw9DzeiUFOv3IgilHC6lM3J44or8Hefi2QnmZddVv2CayI4BMOzUvHREhP1rVEuKSwJ0Px2e6wfg3HR7F9pcf0CYm93SpsCfP9NAtWUXUSFHKiFBHzxFDMmWgcBGWpOxbPgNgp%2FZGx9GSsZMw3Wu8Mfzx10iQv%2Fa7B4CGgpLCITPgIA30jFYw4x%2FdeCoW9UEkI2Iei1fqn2IiBWPLlurv526oVcuvdJMsVGfN1nK%2FMLNA%3D%3D'
            ];

            Mail::send([], [], function ($message) use ($emailNotificationData) {
                $htmlBody = '
                <html>
                    <head>
                    <style>
                        body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        padding: 20px;
                        }
                        .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #ffffff;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                        }
                        h1, h2, h3 {
                        color: #333333;
                        }
                        p {
                        color: #555555;
                        line-height: 1.6;
                        }
                        .divider {
                        border-top: 1px solid #dddddd;
                        margin: 20px 0;
                        }
                        .order-id {
                        font-weight: bold;
                        }
                        .footer {
                        margin-top: 20px;
                        text-align: center;
                        color: #888888;
                        font-size: 12px;
                        }
                        .logo {
                        text-align: center;
                        margin-bottom: 20px;
                        }
                        .logo img {
                        max-width: 100px; /* Adjust the size of the image */
                        }
                    </style>
                    </head>
                    <body>
                    <div class="container">
                        <div class="logo">
                        <img src="' . $emailNotificationData['url'] . '" alt="Logo" style="width: 200px; height: auto;">
                        </div>
                        
                        <p>Hi B.MIC,</p>
                        <p>Your customization request with an request ID of <span class="order-id">' . $emailNotificationData['requestID'] . '</span> ' . $emailNotificationData['status'] . '</p>
                        
                        <div class="divider"></div>
                
                        <h3>REQUEST DETAILS</h3>
                        <p><strong>Request ID:</strong> ' . $emailNotificationData['requestID'] . '</p>
                        <p><strong>Request Date:</strong> ' . $emailNotificationData['requestDate'] . '</p>
                        
                        <div class="divider"></div>
                
                        <p><strong>Subtotal:</strong> P' . $emailNotificationData['subtotal'] . '</p>
                        <p><strong>Shipping Fee:</strong> P100</p>
                        <p><strong>Total Payment:</strong> P' . ($emailNotificationData['subtotal'] + 100) . '</p>
                
                    </div>
                
                    <div class="footer">
                        <p>&copy; ' . date('Y') . ' ARFITCHECK. All rights reserved.</p>
                    </div>
                    </body>
                </html>
                ';

                $message->from(env('MAIL_FROM_ADDRESS'), env('MAIL_FROM_NAME'));
                $message->to($emailNotificationData['email'])
                    ->subject($emailNotificationData['subject'])
                    ->html($htmlBody);
            });

            return response()->json([
                'message' => 'Email sent successfully!'
            ]);
        } catch (\Exception $e) {
            return response($e->getMessage());
        }
    }

        //--------

    //function for moving the data from the customizedRequest collection into the orders collection
    public function moveCustomizationRequestIfCancelledOrRejected($requestID, $cancelReason, $type, $timeStamp)
    {
        try {

            $customizationRequestDataToBeMoved = $this->database->getReference('customizedRequest/' . $requestID)->getSnapshot()->getValue();

            //push through the orders collection so we can read it on the transaction / order history
            $pushedDataRef = $this->database->getReference('orders')->push($customizationRequestDataToBeMoved);
            $pushedCustomizationDataKey = $pushedDataRef->getKey();

            //delete the request from this collection
            $this->database->getReference('customizedRequest/' . $requestID)->remove();

            //update the new pushed data in the orders 
            $this->database->getReference('orders/' . $pushedCustomizationDataKey)->update([
                'associatedOrderID' => $pushedCustomizationDataKey,
                'cancelReason' => $cancelReason === null ? 'None' : $cancelReason,
                'orderStatus' => $type === 'reject' ? 'Request Rejected' : 'Request Cancelled',
                'updateTimeStamp' => $timeStamp,
                'isRated' => true,
                'isPaid' => false,
            ]);
        } catch (\Exception $e) {
            return response($e->getMessage());
        }
    }

    public function moveCustomizationRequestWhenOutForDelivery($requestID, $estimatedTimeOfDelivery, $trackingNumber, $updateTimeStamp)
    {
        try {

            $customizeRequestOutForDelivery = $this->database->getReference('customizedRequest/' . $requestID)->getSnapshot()->getValue();

            $pushedDataRef = $this->database->getReference('orders')->push($customizeRequestOutForDelivery);
            $pushedCustomizationDataKey = $pushedDataRef->getKey();

            $this->database->getReference('customizedRequest/' . $requestID)->remove();

            $this->database->getReference('orders/' . $pushedCustomizationDataKey)->update([
                'associatedOrderID' => $pushedCustomizationDataKey,
                'orderStatus' => 'Parcel out for delivery',
                'trackingNumber' => $trackingNumber,
                'estimatedTimeOfDelivery' => $estimatedTimeOfDelivery,
                'orderDateDelivery' => Carbon::now()->toDateString(),
                'updateTimeStamp' => $updateTimeStamp
            ]);
        } catch (\Exception $e) {
            return response($e->getMessage());
        }
    }
}
