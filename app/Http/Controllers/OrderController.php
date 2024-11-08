<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use GuzzleHttp\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Kreait\Firebase\Contract\Database;
use Kreait\Laravel\Firebase\Facades\Firebase;
use Kreait\Firebase\Storage;

class OrderController extends Controller
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
  //users
  public function fetchMyOrder(Request $request)
  {
    $orders = [];
    if ($this->database->getReference('orders')->getSnapshot()->exists()) {
      foreach ($this->database->getReference('orders')->getSnapshot()->getValue() as $orderID => $orderInfo) {
        if ($request->uid == $orderInfo['uid'] && $orderInfo['orderStatus'] != 'Order Completed' &&  $orderInfo['orderStatus'] != 'Order Cancelled' && $orderInfo['orderStatus'] != 'Request Rejected' && $orderInfo['orderStatus'] != 'Request Cancelled') {
          $orders[] = [
            'orderID' => $orderID,
            'orderInfo' => $orderInfo
          ];
        }
      }

      return response()->json($orders);
    }
  }

  public function fetchCurrentOrderForReceipt(Request $request)
  {
    $orders = [];
    if ($this->database->getReference('orders')->getSnapshot()->exists()) {
      foreach ($this->database->getReference('orders')->getSnapshot()->getValue() as $orderID => $orderInfo) {
        if ($request->uid == $orderInfo['uid'] && $orderInfo['orderStatus'] != 'Order Completed' && $orderInfo['orderTimeStamp'] == $request->orderTimeStamp && $orderInfo['orderDate'] == Carbon::now()->toDateString()) {
          $orders[] = [
            'orderID' => $orderID,
            'orderInfo' => $orderInfo
          ];
        }
      }

      return response()->json($orders);
    }
  }
  //fetching orders by dates using the date calendar
  public function fetchMyOrderByDate(Request $request)
  {
    $ordersByDate = [];
    if ($this->database->getReference('orders')->getSnapshot()->exists()) {
      foreach ($this->database->getReference('orders')->getSnapshot()->getValue() as $orderID => $orderInfo) {
        if ($request->uid == $orderInfo['uid'] && Carbon::parse($request->dateSortRequest)->toDateString() == $orderInfo['orderDate'] && $orderInfo['orderStatus'] != 'Order Completed' && $orderInfo['orderStatus'] != 'Order Cancelled' && $orderInfo['orderStatus'] != 'Request Cancelled' && $orderInfo['orderStatus'] != 'Request Rejected') {
          $ordersByDate[] = [
            'orderID' => $orderID,
            'orderInfo' => $orderInfo
          ];
        }
      }
    }
    $message = "No Orders Found!";
    if (count($ordersByDate) == 0) {
      return response(compact('message'));
    }

    return response()->json($ordersByDate);
  }

  // user history of orders
  public function fetchMyOrderHistoryByDate(Request $request)
  {
    $orderHistoryByDate = [];
    if ($this->database->getReference('orders')->getSnapshot()->exists()) {
      foreach ($this->database->getReference('orders')->getSnapshot()->getValue() as $orderID => $orderInfo) {

        if ($request->uid == $orderInfo['uid'] && Carbon::parse($request->dateSortRequest)->toDateString() == $orderInfo['orderDate'] && $orderInfo['orderStatus'] != 'Waiting for Confirmation' && $orderInfo['orderStatus'] != 'Preparing Order to Ship' && $orderInfo['orderStatus'] != 'Parcel out for delivery') {
          $orderHistoryByDate[] = [
            'orderID' => $orderID,
            'orderInfo' => $orderInfo
          ];
        }
      }
    }

    $message = "No Orders Found!";
    if (count($orderHistoryByDate) == 0) {
      return response(compact('message'));
    }

    return response()->json($orderHistoryByDate);
  }

  public function fetchOrderHistoryOrders(Request $request)
  {
    $completedOrders = [];

    if ($this->database->getReference('orders')->getSnapshot()->exists()) {
      foreach ($this->database->getReference('orders')->getSnapshot()->getValue() as $orderID => $orderInfo) {
        if ($request->uid == $orderInfo['uid']) {

          if ($orderInfo['orderStatus'] == 'Order Completed' || $orderInfo['orderStatus'] == 'Order Cancelled' || $orderInfo['orderStatus'] == 'Request Rejected' || $orderInfo['orderStatus'] === 'Request Cancelled') {
            $completedOrders[] = [
              'orderID' => $orderID,
              'orderInfo' => $orderInfo
            ];
          }
        }
      }

      if (count($completedOrders) > 0) {
        return response()->json($completedOrders);
      } else {
        $message = "No Order has been completed yet.";
        return response(compact('message'));
      }
    } else {
      $message = "No orders found in the database.";
      return response(compact('message'));;
    }
  }

  public function fetchMyAddress(Request $request)
  {

    foreach ($this->database->getReference('address')->getSnapshot()->getValue() as $addressInfo) {
      if ($request->uid == $addressInfo['uid']) {
        return response()->json($addressInfo);
        break;
      }
    }
  }

  //admin side fetching
  public function fetchReportsData()
  {
    $totalOrders = 0;
    $pendingOrders = 0;
    $completedOrders = 0;
    $totalProducts = 0;
    $customizedOrders = 0;
    $customizedRequest = 0;
    $cancelledOrders = 0;

    $totalUsers = 0;

    //I declare this to store duplicated orders with an an associated ID to the previous order
    $totalNumberOfDuplicatesForTotalOrders = 0;
    $totalNumberOfDuplicatesForCompletedOrders = 0;

    foreach ($this->database->getReference('users')->getSnapshot()->getValue() as $userInfo) {
      if ($userInfo['role'] == 'user') {
        $totalUsers++;
      }
    }

    if ($this->database->getReference('products')->getSnapshot()->exists()) {
      foreach ($this->database->getReference('products')->getSnapshot()->getValue() as $productInfo) {
        $totalProducts++;
      }
    }

    if ($this->database->getReference('customizedRequest')->getSnapshot()->exists()) {
      foreach ($this->database->getReference('customizedRequest')->getSnapshot()->getValue() as $customizationRequest) {
        $customizedRequest++;
      }
    }

    if ($this->database->getReference('orders')->getSnapshot()->exists()) {
      foreach ($this->database->getReference('orders')->getSnapshot()->getValue() as $orderID => $orderInfo) {

        if (
          $orderID == $orderInfo['associatedOrderID'] && $orderInfo['isBulkyOrder'] === true &&
          $orderInfo['orderStatus'] != 'Order Cancelled' && $orderInfo['orderStatus'] != 'Order Completed' &&
          $orderInfo['orderType'] === 'default'

        ) {
          $totalNumberOfDuplicatesForTotalOrders++;
        }

        if (
          $orderID == $orderInfo['associatedOrderID'] && $orderInfo['isBulkyOrder'] === true && $orderInfo['orderType'] === 'default' && $orderInfo['orderStatus'] === 'Order Completed'

        ) {
          $totalNumberOfDuplicatesForCompletedOrders++;
        }

        $totalOrders++;

        if ($orderInfo['orderStatus'] === 'Waiting for Confirmation' || $orderInfo['orderStatus'] === 'Order Confirmed' || $orderInfo['orderStatus'] === 'Preparing Order to Ship') {
          $pendingOrders++;
        }

        if ($orderInfo['orderStatus'] === 'Order Completed' && $orderInfo['isBulkyOrder'] === false) {
          $completedOrders++;
        }

        if ($orderInfo['orderType'] === 'custom') {
          $customizedOrders++;
        }

        if ($orderInfo['orderStatus'] == 'Order Cancelled' || $orderInfo['orderStatus'] == 'Request Cancelled') {
          $cancelledOrders++;
        }
      }
    }

    return response()->json([
      'totalOrders' => $totalOrders - $totalNumberOfDuplicatesForCompletedOrders,
      'pendingOrders' => $pendingOrders == 0 ? 0 : $pendingOrders - $totalNumberOfDuplicatesForTotalOrders,
      'completedOrders' => $completedOrders + $totalNumberOfDuplicatesForCompletedOrders,
      'customizedOrders' => $customizedOrders + $customizedRequest,
      'cancelledOrder' => $cancelledOrders,
      'totalProducts' => $totalProducts,
      'totalUsers' => $totalUsers
    ]);
  }

  public function fetchOrders()
  {
    if ($this->database->getReference('orders')->getSnapshot()->exists()) {

      $userOrders = [];
      foreach ($this->database->getReference('orders')->getSnapshot()->getValue() as $orderID => $orderInfo) {
        if ($orderInfo['orderStatus'] != 'Order Completed' && $orderInfo['orderStatus'] != 'Order Cancelled' && $orderInfo['orderStatus'] != 'Cancellation Requested' && $orderInfo['orderStatus'] != 'Request Rejected' && $orderInfo['orderStatus'] != 'Request Cancelled') {
          $userOrders[] = [
            'orderID' => $orderID,
            'orderInfo' => $orderInfo
          ];
        }
      }

      return response()->json($userOrders);
    }
  }

  public function fetchCancelRequestOrders()
  {

    //loop through the database of the orders
    if ($this->database->getReference('orders')->getSnapshot()->exists()) {

      //look for the orders with the stattsu of Cancellation Requested only
      $userOrders = [];
      foreach ($this->database->getReference('orders')->getSnapshot()->getValue() as $orderID => $orderInfo) {
        if ($orderInfo['orderStatus'] === 'Cancellation Requested') {
          $userOrders[] = [
            'orderID' => $orderID,
            'orderInfo' => $orderInfo
          ];
        }
      }

      return response()->json($userOrders);
    }
  }

  public function fetchOutForDeliveryOrders()
  {
    try {

      $orderData = [];
      if ($this->database->getReference('orders')->getSnapshot()->exists()) {
        foreach ($this->database->getReference('orders')->getSnapshot()->getValue() as $orderID => $orderInfo) {
          if ($orderInfo['orderStatus'] === 'Parcel out for delivery' && $orderInfo['isNotified'] === false && $orderInfo['associatedOrderID'] === $orderID) {
            $orderData[] = [
              'orderID' => $orderID,
              'orderInfo' => $orderInfo
            ];
          }
        }
      }

      return response()->json($orderData);
    } catch (\Exception $e) {
      return response($e->getMessage());
    }
  }

  //transaction history data (admin side)
  public function fetchTransactionHistoryData()
  {
    $orderData = [];
    if ($this->database->getReference('orders')->getSnapshot()->exists()) {
      foreach ($this->database->getReference('orders')->getSnapshot()->getValue() as $orderID => $orderInfo) {
        if ($orderInfo['orderStatus'] === 'Order Completed' || $orderInfo['orderStatus'] === 'Order Cancelled' || $orderInfo['orderStatus'] === 'Request Rejected' || $orderInfo['orderStatus'] === 'Request Cancelled') {
          $orderData[] = [
            'orderID' => $orderID,
            'orderInfo' => $orderInfo
          ];
        }
      }
    }
    return response()->json($orderData);
  }

  public function fetchTransactionHistoryDataByDate($dataSortRequest)
  {
    try {

      $orderData = [];
      if ($this->database->getReference('orders')->getSnapshot()->exists()) {
        foreach ($this->database->getReference('orders')->getSnapshot()->getValue() as $orderID => $orderInfo) {
          if (Carbon::parse($dataSortRequest)->isSameDay(Carbon::parse($orderInfo['orderDate']))) {
            if ($orderInfo['orderStatus'] === 'Order Completed' || $orderInfo['orderStatus'] === 'Order Cancelled' || $orderInfo['orderStatus'] === 'Request Rejected' || $orderInfo['orderStatus'] === 'Request Cancelled') {
              $orderData[] = [
                'orderID' => $orderID,
                'orderInfo' => $orderInfo,
              ];
            }
          }
        }
      }
      $message = "No Orders Found!";
      if (count($orderData) == 0) {
        return response(compact('message'));
      }
      return response()->json($orderData);
    } catch (\Exception $e) {
      return response($e->getMessage());
    }
  }

  public function fetchOrdersByDate($dataSortRequest)
  {
    try{

      $orderData = [];
      if ($this->database->getReference('orders')->getSnapshot()->exists()) {
        foreach ($this->database->getReference('orders')->getSnapshot()->getValue() as $orderID => $orderInfo) {
          if (Carbon::parse($dataSortRequest)->isSameDay(Carbon::parse($orderInfo['orderDate']))) {
            if ($orderInfo['orderStatus'] != 'Order Completed' && $orderInfo['orderStatus'] != 'Order Cancelled' && $orderInfo['orderStatus'] != 'Request Rejected' && $orderInfo['orderStatus'] != 'Request Cancelled') {
              $orderData[] = [
                'orderID' => $orderID,
                'orderInfo' => $orderInfo,
              ];
            }
          }
        }
      }
      $message = "No Orders Found!";
      if (count($orderData) == 0) {
        return response(compact('message'));
      }

      return response()->json($orderData);

    }catch(\Exception $e) {
      return response($e->getMessage());
    }
  }

  public function fetchCancelRequestOrdersByDate($dataSortRequest)
  {
      try {
          $orderData = [];
          
          if ($this->database->getReference('orders')->getSnapshot()->exists()) {
              foreach ($this->database->getReference('orders')->getSnapshot()->getValue() as $orderID => $orderInfo) {
                  if (Carbon::parse($dataSortRequest)->isSameDay(Carbon::parse($orderInfo['orderDate']))) {
                      if ($orderInfo['orderStatus'] === 'Cancellation Requested') {
                          $orderData[] = [
                              'orderID' => $orderID,
                              'orderInfo' => $orderInfo,
                          ];
                      }
                  }
              }
          }
  
          if ($this->database->getReference('customizedRequest')->getSnapshot()->exists()) {
              foreach ($this->database->getReference('customizedRequest')->getSnapshot()->getValue() as $customID => $customInfo) {
                  if (Carbon::parse($dataSortRequest)->isSameDay(Carbon::parse($customInfo['orderDate']))) {
                      if ($customInfo['orderStatus'] === 'Cancellation Requested') {
                          $orderData[] = [
                              'orderID' => $customID,
                              'orderInfo' => $customInfo,
                          ];
                      }
                  }
              }
          }
  
          $message = "No Cancellation Requests Found!";
          if (count($orderData) == 0) {
              return response(compact('message'));
          }
  
          return response()->json($orderData);
  
      } catch (\Exception $e) {
          return response($e->getMessage());
      }
  }

  //----------------------------------------------------
  public function receiveMyOrder(Request $request)
  {
    try {

      $orders = $this->database->getReference('orders')->getSnapshot()->getValue();
      $products = $this->database->getReference('products')->getSnapshot()->getValue();

      // variables for finding the target order
      $targetOrder = null;

      foreach ($orders as $orderID => $orderInfo) {
        if ($request->orderID == $orderID) {

          $targetOrder = $orderInfo;

          break;
        }
      }

      //loop through orders again to update all orders with the matching timestamp and uid
      foreach ($products as $productID => $productInfo) {

        foreach ($orders as $orderID => $orderInfo) {

          if (($orderInfo['orderTimeStamp'] == $targetOrder['orderTimeStamp'] && $orderInfo['uid'] == $targetOrder['uid'] && $request->associatedOrderID == $orderInfo['associatedOrderID'] && $orderInfo['productName'] == $productInfo['productName'])) {

            //update data for orders
            $updateOrderData = [

              'statusBeforeCancel' => "None",
              'userCancelReason' => "None",
              'userCancelReasonAdditional' => "None",
              'isReceived' => true,
              'orderStatus' =>  'Order Completed'
            ];

            //update the orders cllection
            $this->database->getReference('orders/' . $orderID)->update($updateOrderData);
          }
        }
      }

      $message = "Success! Order moved to history.";
      return response(compact('message'));
    } catch (\Exception $e) {
      return response($e->getMessage());
    }
  }

  //order requests
  public function cancelOrderRequest(Request $request)
  {
    try {
      $orders = $this->database->getReference('orders')->getSnapshot()->getValue();

      // variables for finding the target order
      $targetOrder = null;

      foreach ($orders as $orderID => $orderInfo) {
        if ($request->orderID == $orderID) {

          $targetOrder = $orderInfo;

          break;
        }
      }

      // Loop through orders again to update all orders with the matching timestamp and uid
      foreach ($orders as $orderID => $orderInfo) {
        if (
          ($orderInfo['orderTimeStamp'] == $targetOrder['orderTimeStamp'] && $orderInfo['uid'] == $targetOrder['uid'] && $request->associatedOrderID == $orderInfo['associatedOrderID'])
        ) {

          //update the data in the db
          $updateOrderData = [
            'statusBeforeCancel' => $targetOrder['orderStatus'],
            'userCancelReason' => $request->reason,
            'userCancelReasonAdditional' => $request->additionalInformation ? $request->additionalInformation : 'None',
            'orderStatus' => $orderInfo['orderStatus'] == 'Waiting for Confirmation' ? 'Order Cancelled' : 'Cancellation Requested',
            'isRated' => true
          ];

          $this->database->getReference('orders/' . $orderID)->update($updateOrderData);
        }
      }

      //notify the admin for cancel request
      $this->notifyAdmin(Carbon::now()->toDateString(), Carbon::now('Asia/Manila')->format('h:i A'), 'Cancel', $request->orderID);
      $targetOrder['orderStatus'] === 'Waiting for Confirmation' ? '' : $this->sendEmailNotificationForAdminIfCancelRequest($request->orderID);

      $message = 'Cancellation Request Sent! It will be processed within 2-3 business days.';
      return response(compact('message'));
    } catch (\Exception $e) {
      return response($e->getMessage());
    }
  }

  public function rejectCancelOrderRequest(Request $request)
  {
    try {

      $orders = $this->database->getReference('orders')->getSnapshot()->getValue();

      // variables for finding the target order
      $targetOrder = null;
      $firstName = '';
      foreach ($orders as $orderID => $orderInfo) {
        if ($request->orderID == $orderID) {

          $targetOrder = $orderInfo;
          $firstName = $this->database->getReference('users/' . $orderInfo['uid'] . '/firstName')->getSnapshot()->getValue();
          break;
        }
      }

      //loop through the orders again and look for the order with the same timestamp and uid
      foreach ($orders as $orderID => $orderInfo) {
        if (($orderInfo['orderTimeStamp'] == $targetOrder['orderTimeStamp'] && $orderInfo['uid'] == $targetOrder['uid'] && $request->associatedOrderID == $orderInfo['associatedOrderID'])) {
          //update the order info
          $updateOrderInfo = [
            'orderStatus' => $orderInfo['statusBeforeCancel'],
            'statusBeforeCancel' => "None",
            'userCancelReason' => "None",
            'userCancelReasonAdditional' => "None",
            'isRated' => false
          ];

          //push the update
          $this->database->getReference('orders/' . $orderID)->update($updateOrderInfo);
        }
      }

      // notify the user about the rejection of the cancellation of the request
      $this->notifyUserForCancellationRequestRejection($orderID, $targetOrder['uid']);
      $this->sendEmailForCancelRequestStatus($orderID, $targetOrder['uid'], $targetOrder['email'], 'rejectCancelReq', $firstName);
    } catch (\Exception $e) {

      return response($e->getMessage());
    }
  }

  public function placeOrder(Request $request)
  {
    // variables
    $receiptImageURL = "";
    $firstOrderKey = "";
    $countOrder = 0;
    $cartItems = $this->database->getReference('cart')->getSnapshot()->getValue();
    $fullAddress = $request->address . ' - ' . $request->barangay . ', ' . $request->city . ', ' . $request->postalCode . ', ' . 'Philippines';
    $mobilePhone = $this->database->getReference('users/' . $request->uid . '/mobileNumber')->getSnapshot()->getValue();
    $email =  $this->database->getReference('users/' . $request->uid . '/email')->getSnapshot()->getValue();
    $firstName =  $this->database->getReference('users/' . $request->uid . '/firstName')->getSnapshot()->getValue();
    $lastName = $this->database->getReference('users/' . $request->uid . '/lastName')->getSnapshot()->getValue();

    if ($request->paymentMethod === 'ewallet') {
      $receiptImageFile = $request->file('receiptFile');
      $receiptImageName = 'receipts/' . $receiptImageFile->getClientOriginalName();

      $this->storage->getBucket()->upload($receiptImageFile->getContent(), [
        'name' => $receiptImageName
      ]);

      $fireBaseStoragePath = $receiptImageName;
      $receiptImageURL = $this->storage->getBucket()->object($fireBaseStoragePath)->signedUrl(new \DateTime('3000-01-01T00:00:00Z'));
    }

    $cartCount = count(array_filter($cartItems, function ($cartInfo) use ($request) {
      return $request->uid == $cartInfo['uid'];
    }));

    $isBulkyOrder = $cartCount > 1 ? true : false;

    foreach ($cartItems as $cartID => $cartInfo) {

      if ($request->uid == $cartInfo['uid']) {
        $orderInfo = [

          'productName' => $cartInfo['productName'],
          'productQuantity' => $cartInfo['productQuantity'],
          'productCategory' => $cartInfo['productCategory'],
          'productPrice' => $cartInfo['productPrice'],
          'productImage' => $cartInfo['productImage'],
          'productSize' => $cartInfo['productSize'] ?? '',

          'associatedOrderID' => 'None',
          'cancelReason' => 'None',
          'cancelReasonAdditional' => 'None',
          'userCancelReason' => 'None',
          'userCancelReasonAdditional' => 'None',
          'orderStatus' => 'Waiting for Confirmation',
          'trackingNumber' => '',
          'estimatedTimeOfDelivery' => '',
          'orderDateDelivery' => '', //when the order status is updated into out for delivery, this will serve as a reference for enabling receive button
          'orderType' => $request->orderType == 'default' ? 'default' : 'custom',

          'recipientName' => $request->recipientName,
          'email' => $request->email,
          'city' => $request->city,
          'barangay' => $request->barangay,
          'addressLine' => $request->address,
          'postalCode' => $request->postalCode,
          'amountToPay' => $request->amountToPay + 100,
          'paymentMethod' => $request->paymentMethod,
          'uid' => $request->uid,
          'orderNotes' => $request->orderNotes ? $request->orderNotes : 'None',
          'receiptImage' => $request->paymentMethod === 'cash' ? 'None' : $receiptImageURL,

          'orderDate' => Carbon::now()->toDateString(),
          'orderTimeStamp' => Carbon::now('Asia/Manila')->format('h:i A'),
          'updateTimeStamp' => '',

          'fullShippingAddress' => $fullAddress,
          'mobileNumber' => $mobilePhone,
          'isBulkyOrder' => $isBulkyOrder,

          'isReceived' => false,
          'isRated' => false,
          'isNotified' => false
        ];

        // if its the first order, store the first order key
        if ($countOrder == 0) {

          $orderRef = $this->database->getReference('orders')->push($orderInfo);
          $firstOrderKey = $orderRef->getKey(); //this is the id of the first order among the rest of bulk orders 

          //since I got the first order ID, updat the first order itself based on the firstOrderKey
          $this->database->getReference('orders/' . $firstOrderKey)->update([
            'associatedOrderID' => $firstOrderKey
          ]);
        } else {
          // 
          $orderInfo['associatedOrderID'] = $firstOrderKey;
          $this->database->getReference('orders')->push($orderInfo);
        }

        //increase the count so the condition above works for bulky orders.
        $countOrder++;
      }
    }

    // Remove items from the cart for the user
    foreach ($cartItems as $cartID => $cartInfo) {
      if ($request->uid == $cartInfo['uid']) {
        $this->database->getReference('cart/' . $cartID)->remove();
      }
    }

    // Notify admin
    $this->notifyAdmin(Carbon::now()->toDateString(), Carbon::now('Asia/Manila')->format('h:i A'), 'Order', $firstOrderKey);
    // send email notif for placing order
    $this->sendEmailNotificationForReceipt($firstOrderKey, $email, $firstName, $lastName, Carbon::now()->toDateString(), $request->amountToPay, $mobilePhone, $fullAddress, 'place', null, null);

    // Return response
    $message = "Checkout Successful! Thank you for purchasing.";
    return response(compact('message'));
  }

  //mobile function when the user decided to use the application to order
  public function singleProductPlaceOrder(Request $request)
  {
    try {

      // variables
      $receiptImageURL = "";
      $firstOrderKey = "";
      $singleProductOrderInfo = [];
      $fullAddress = $request->address . ' - ' . $request->barangay . ', ' . $request->city . ', ' . $request->postalCode . ', ' . 'Philippines';
      $mobilePhone = $this->database->getReference('users/' . $request->uid . '/mobileNumber')->getSnapshot()->getValue();
      $firstName =  $this->database->getReference('users/' . $request->uid . '/firstName')->getSnapshot()->getValue();
      $lastName = $this->database->getReference('users/' . $request->uid . '/lastName')->getSnapshot()->getValue();
      $email =  $this->database->getReference('users/' . $request->uid . '/email')->getSnapshot()->getValue();

      if ($request->paymentMethod === 'ewallet') {
        $receiptImageFile = $request->file('receiptFile');
        $receiptImageName = 'receipts/' . $receiptImageFile->getClientOriginalName();

        $this->storage->getBucket()->upload($receiptImageFile->getContent(), [
          'name' => $receiptImageName
        ]);

        $fireBaseStoragePath = $receiptImageName;
        $receiptImageURL = $this->storage->getBucket()->object($fireBaseStoragePath)->signedUrl(new \DateTime('3000-01-01T00:00:00Z'));
      }

      //instead of looping through the cart, we are going to loop through the products 
      foreach ($this->database->getReference('products')->getSnapshot()->getValue() as $productID => $productInfo) {

        if ($request->productID == $productID) {

          $singleProductOrderInfo = [

            'productName' => $productInfo['productName'],
            'productPrice' => $productInfo['productPrice'],
            'productImage' => $productInfo['productImage'],
            'productCategory' => $productInfo['productCategory'],
            'productSize' => $request->productSize,
            'productQuantity' => $request->productQuantity,

            'recipientName' => $request->recipientName,
            'email' => $request->email,
            'city' => $request->city,
            'barangay' => $request->barangay,
            'addressLine' => $request->address,
            'postalCode' => $request->postalCode,
            'amountToPay' => $request->amountToPay + 100,
            'paymentMethod' => $request->paymentMethod,
            'uid' => $request->uid,
            'orderNotes' => $request->orderNotes ? $request->orderNotes : 'None',
            'orderType' => $request->orderType == 'default' ? 'default' : 'customized',
            'receiptImage' => $request->paymentMethod === 'cash' ? 'None' : $receiptImageURL,

            'associatedOrderID' => 'None',
            'cancelReason' => 'None',
            'cancelReasonAdditional' => 'None',
            'userCancelReason' => 'None',
            'userCancelReasonAdditional' => 'None',
            'trackingNumber' => '',
            'estimatedTimeOfDelivery' => '',
            'orderDateDelivery' => '',
            'orderStatus' => 'Waiting for Confirmation',

            'orderDate' => Carbon::now()->toDateString(),
            'orderTimeStamp' => Carbon::now('Asia/Manila')->format('h:i A'),
            'updateTimeStamp' => '',

            'fullShippingAddress' => $fullAddress,
            'mobileNumber' => $mobilePhone,

            'isBulkyOrder' => false,
            'isReceived' => false,
            'isRated' => false,
            'isNotified' => true

          ];
        }
      }

      $orderRef = $this->database->getReference('orders')->push($singleProductOrderInfo);
      $firstOrderKey = $orderRef->getKey(); //this is the id of the first order among the rest of bulk orders 

      //since I got the first order ID, updat the first order itself based on the firstOrderKey
      $this->database->getReference('orders/' . $firstOrderKey)->update([
        'associatedOrderID' => $firstOrderKey
      ]);

      // notify admin once order placed (inside system)
      $this->notifyAdmin(Carbon::now()->toDateString(), Carbon::now('Asia/Manila')->format('h:i A'), 'Order', $firstOrderKey);

      // notify user via email
      $this->sendEmailNotificationForReceipt($firstOrderKey, $email, $firstName, $lastName, Carbon::now()->toDateString(), $request->amountToPay, $mobilePhone, $fullAddress, 'place', null, null);

      $message = "Checkout Successful! Thank you for purchasing.";
      return response(compact('message'));
    } catch (\Exception $e) {
      return response($e->getMessage());
    }
  }
  // updating && ratings

  public function updateTotalProductSold($productName, $orderQuantity, $size, $productCategory)
  {
    try {

      //totalSold variavles
      $prevTotalProductSold = 0;
      $newTotalProductSold = 0;

      foreach ($this->database->getReference('products')->getSnapshot()->getValue() as  $productID => $productInfo) {
        if ($productName == $productInfo['productName']) {

          //get the previous total product sold of that product
          $prevTotalProductSold = $productInfo['totalSold'];
          $newTotalProductSold = $prevTotalProductSold + $orderQuantity;

          if ($productCategory === 'Caps') {
            //if the product category is caps since it dont have a size, so I removed the sizeQuantity subtraction here
            $updateProduct = [
              'productQuantity' => $productInfo['productQuantity'] - $orderQuantity,
              'isCriticalLevel' => $productInfo['productQuantity'] <= $productInfo['productCriticalLevel'] ? true : false,
              'totalSold' => $newTotalProductSold
            ];
          } else {
            $updateProduct = [
              'productQuantity' => $productInfo['productQuantity'] - $orderQuantity,
              $size . '' . 'Quantity' => $productInfo[$size . '' . 'Quantity'] === 0 ? 0 : $productInfo[$size . '' . 'Quantity'] - $orderQuantity,
              'isCriticalLevel' => $productInfo['productQuantity'] <= $productInfo['productCriticalLevel'] ? true : false,
              'totalSold' => $newTotalProductSold
            ];
          }

          $this->database->getReference('products/' . $productID)->update($updateProduct);
        }
      }
    } catch (\Exception $e) {
      return response($e->getMessage());
    }
  }

  public function updateOrderStatus(Request $request)
  {
    try {
      // get the fcking order data
      $orders = $this->database->getReference('orders')->getSnapshot()->getValue();

      $updateTimeStamp = Carbon::now('Asia/Manila')->format('h:i A');

      $orderStatus = '';

      // Variables for notifications
      $fullAddress = '';
      $mobilePhone = '';
      $email =  '';
      $firstName =  '';
      $lastName = '';
      $paymentMethod = '';
      $orderDeliveryDate = '';
      $totalAmountToPay = 0;

      $emailSent = false;

      // Finding the specific order details based on $request->orderID
      $targetOrder = null;
      foreach ($orders as $orderID => $orderInfo) {
        if ($request->orderID == $orderID || $request->associatedOrderID == $orderID) {
          $targetOrder = $orderInfo;
          $mobilePhone = $orderInfo['mobileNumber'];
          $email = $orderInfo['email'];
          $firstName = $this->database->getReference('users/' . $orderInfo['uid'] . '/firstName')->getSnapshot()->getValue();
          $lastName = $this->database->getReference('users/' . $orderInfo['uid'] . '/lastName')->getSnapshot()->getValue();
          $fullAddress = $orderInfo['fullShippingAddress'];
          $paymentMethod = $orderInfo['paymentMethod'];
          $totalAmountToPay = $orderInfo['amountToPay'];
          break;
        }
      }

      // Determine the size based on productSize
      $sizeMo = '';
      switch ($targetOrder['productSize']) {
        case 'S':
          $sizeMo = 'small';
          break;
        case 'M':
          $sizeMo = 'medium';
          break;
        case 'L':
          $sizeMo = 'large';
          break;
        case 'XL':
          $sizeMo = 'extraLarge';
          break;
        case '2XL':
          $sizeMo = 'doubleXL';
          break;
        default:
          $sizeMo = 'tripleXL';
          break;
      }

      foreach ($orders as $orderID => $orderInfo) {
        if (($orderInfo['orderTimeStamp'] == $targetOrder['orderTimeStamp'] && $orderInfo['uid'] == $targetOrder['uid'] && $request->associatedOrderID == $orderInfo['associatedOrderID'])) {

          $isBulkyOrder = $orderInfo['isBulkyOrder'];

          switch ($request->orderType) {
            case 'Confirm':
              $orderStatus = 'Order Confirmed';

              //check first if the order was not a bulky order (an order is considered bulky if there are more than 1 products placed in one order.) This will prevent to run the loop many times which results in sending the email multiple times.
              if (!$isBulkyOrder) {
                $this->sendEmailNotificationForReceipt($orderID, $email, $firstName, $lastName, $orderInfo['orderDate'], $totalAmountToPay - 100, $mobilePhone, $fullAddress, 'confirm', null, null);
              }

              break;
            case 'Cancel':
              $orderStatus = 'Order Cancelled';
              if (!$isBulkyOrder) {
                $this->sentNotificationIfAdminCancelOrder($orderID, $email, $firstName, $lastName, $orderInfo['orderDate'], $totalAmountToPay - 100, $mobilePhone, $fullAddress, $request->cancelReason, $request->cancelReasonAdditional);
              }

              //since this function is also being called when the admin approved a cancellation request, we will also put here a condition to determine if its a cancellation request or not
              if ($request->isCancellationRequest && !$isBulkyOrder) {
                $this->notifyUserForCancellationRequestApproval($orderID, $targetOrder['uid']);
                $this->sendEmailForCancelRequestStatus($orderID, $targetOrder['uid'], $email, 'cancelReq', $firstName);
              }

              break;
            case 'Prepare':
              $orderStatus = 'Preparing Order to Ship';
              break;
            default:
              $orderStatus = 'Parcel out for delivery';
              // what this function does it updates the quantity of the specific product based on size
              $this->updateTotalProductSold($orderInfo['productName'], $orderInfo['productQuantity'], $sizeMo, $orderInfo['productCategory']);
              $orderDeliveryDate = Carbon::now()->toDateString();
              break;
          }

          $orderUpdates = [
            'orderStatus' => $orderStatus,
            'updateTimeStamp' => $updateTimeStamp,
            'cancelReason' => $request->cancelReason ? $request->cancelReason : 'None',
            'cancelReasonAdditional' => $request->cancelReasonAdditional ? $request->cancelReasonAdditional : 'None',
            'orderDateDelivery' => $orderDeliveryDate,
            'trackingNumber' => $request->trackingNumber ? $request->trackingNumber : '',
            'estimatedTimeOfDelivery' => $request->estimatedTimeOfDelivery ? $request->estimatedTimeOfDelivery : '',

          ];

          //update the specific order
          $this->database->getReference('orders/' . $orderID)->update($orderUpdates);
        }
      }

      //check if the order status is parcel out for delivery
      if ($orderStatus == 'Parcel out for delivery') {
        $this->notifyUsersForOrderDelivery($mobilePhone, $totalAmountToPay, $request->orderID, $paymentMethod, $targetOrder['uid'], $request->trackingNumber, $request->estimatedTimeOfDelivery);

        $this->sendEmailNotificationForReceipt($request->orderID, $email, $firstName, $lastName, Carbon::now()->toDateString(), $totalAmountToPay - 100, $mobilePhone, $fullAddress, 'delivery', $request->trackingNumber, $request->estimatedTimeOfDelivery);
      }


      //this handles bulky orders to which prevents the multple sending of emails for each products / orders

      if ($orderStatus == 'Order Confirmed' && $isBulkyOrder && !$emailSent) {

        $this->sendEmailNotificationForReceipt($request->orderID, $email, $firstName, $lastName, Carbon::now()->toDateString(), $totalAmountToPay - 100, $mobilePhone, $fullAddress, 'confirm', null, null);
        $emailSent = true;
      }

      if ($orderStatus == 'Order Cancelled' && $isBulkyOrder && !$emailSent && !$request->isCancellationRequest) {

        $this->sentNotificationIfAdminCancelOrder($orderID, $email, $firstName, $lastName, $orderInfo['orderDate'], $totalAmountToPay - 100, $mobilePhone, $fullAddress, $request->cancelReason, null);
        $emailSent = true;
      }

      if ($orderStatus == 'Order Cancelled' && $isBulkyOrder && !$emailSent && $request->isCancellationRequest) {
        $this->notifyUserForCancellationRequestApproval($orderID, $targetOrder['uid']);
        $this->sendEmailForCancelRequestStatus($orderID, $targetOrder['uid'], $email, 'cancelReq', $firstName);
        $emailSent = true;
      }

      $message = 'Order Status Updated';
      return response(compact('message'));
    } catch (\Exception $e) {
      return response($e->getMessage());
    }
  }

  public function updateProductStarRating(Request $request)
  {
    try {

      $orders = $this->database->getReference('orders')->getSnapshot()->getValue();
      $products = $this->database->getReference('products')->getSnapshot()->getValue();
      $targetOrder = null;

      $updateProductStarRatings = [];

      //target order since I have an associated order ID, this loops gets the main parent of the order even if it is a bulk order
      foreach ($orders as $orderID => $orderInfo) {
        if ($request->orderID == $orderID) {
          $targetOrder = $orderInfo;
          break;
        }
      }

      //im looping through the products collection so I can get the data for the stars count
      foreach ($products as $productID => $productInfo) {

        foreach ($orders as $orderID => $orderInfo) {

          //check if the orders are assoicated to the target orderID and the product name is equals to the product name in the products collection
          if (($orderInfo['orderTimeStamp'] == $targetOrder['orderTimeStamp'] && $orderInfo['uid'] == $targetOrder['uid'] && $request->associatedOrderID == $orderInfo['associatedOrderID'] && $orderInfo['productName'] == $productInfo['productName'])) {

            //product rating (this includes the order, design, quality, and materials of the product)
            $productFiveStarCount = $productInfo['productFiveStarCount'];
            $productFourStarCount = $productInfo['productFourStarCount'];
            $productThreeStarCount = $productInfo['productThreeStarCount'];
            $productTwoStarCount = $productInfo['productTwoStarCount'];
            $productOneStarCount = $productInfo['productOneStarCount'];

            if ($request->productRating == 5) {

              $productFiveStarCount++;
            } else if ($request->productRating >= 4 && $request->productRating <= 4.5) {

              $productFourStarCount++;
            } else if ($request->productRating >= 3 && $request->productRating <= 3.5) {

              $productThreeStarCount++;
            } else if ($request->productRating >= 2 && $request->productRating <= 2.5) {

              $productTwoStarCount++;
            } else if ($request->productRating >= 1 && $request->productRating <= 1.5) {

              $productOneStarCount++;
            }

            $productTotalStarCount = $productFiveStarCount + $productFourStarCount + $productThreeStarCount + $productTwoStarCount + $productOneStarCount;

            $updateProductStarRatings = [

              'productFiveStarCount' => $productFiveStarCount,
              'productFourStarCount' => $productFourStarCount,
              'productThreeStarCount' => $productThreeStarCount,
              'productTwoStarCount' => $productTwoStarCount,
              'productOneStarCount' => $productOneStarCount,
              'productTotalStarCount' => $productTotalStarCount
            ];
            //update query
            $this->database->getReference('products/' . $productID)->update($updateProductStarRatings);

            //update the star average rating
            $this->updateTotalAverageRating($targetOrder['uid'], $targetOrder['orderTimeStamp'], $request->associatedOrderID, $productTotalStarCount);
          }
        }
      }

      $message = "Rated Successfully!";
      return response(compact('message'));
    } catch (\Exception $e) {
      $message = $e->getMessage();
      return response(compact('message'));
    }
  }

  public function updateTotalAverageRating($targetUID, $targetOrderTimeStamp, $associatedOrderID, $productTotalStarCount)
  {
    try {

      //variables 
      $updatedProductRatingAverage = [];
      $updatedOrderInfo = [];
      $message = '';

      foreach ($this->database->getReference('products')->getSnapshot()->getValue() as $productID => $productInfo) {

        foreach ($this->database->getReference('orders')->getSnapshot()->getValue() as $orderID => $orderInfo) {

          if (($orderInfo['orderTimeStamp'] == $targetOrderTimeStamp && $orderInfo['uid'] == $targetUID && $associatedOrderID == $orderInfo['associatedOrderID'] && $orderInfo['productName'] == $productInfo['productName'])) {

            $fiveStarProduct = 5 * $productInfo['productFiveStarCount'];
            $fourStarProduct = 4 * $productInfo['productFourStarCount'];
            $threeStarProduct = 3 * $productInfo['productThreeStarCount'];
            $twoStarProduct = 2 * $productInfo['productTwoStarCount'];
            $oneStarProduct = 1 * $productInfo['productOneStarCount'];

            $newProductTotalRatingAverage = $fiveStarProduct + $fourStarProduct + $threeStarProduct + $twoStarProduct + $oneStarProduct;
            round($newProductTotalRatingAverage /= $productTotalStarCount, 2);

            //setting the updated data
            $updatedOrderInfo = [
              'isRated' => true,
            ];

            $updatedProductRatingAverage = [
              'productRatings' => $newProductTotalRatingAverage
            ];

            //update both products and orders collection
            $this->database->getReference('orders/' . $orderID)->update($updatedOrderInfo);
            $this->database->getReference('products/' . $productID)->update($updatedProductRatingAverage);
          }
        }
      }
    } catch (\Exception $e) {
      $message = $e->getMessage();
      return response(compact('message'));
    }
  }

  //notifications functions and unrounted routes
  public function notifyAdmin($dateOrdered, $timeStamp, $notificationType, $orderID)
  {
    try {

      //loop the db to find the user with a super admin and admin role
      foreach ($this->database->getReference('users')->getSnapshot()->getValue() as $adminID => $adminInfo) {
        if ($adminInfo['role'] == 'superadmin' || $adminInfo['role'] == 'admin') {

          $notificationData = [
            'adminID' => $adminID,
            'notificationMessage' => $notificationType === 'Order' ? 'An Order has been placed.' : 'User requested cancellation for the order ' . $orderID . '.',
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

  public function notifyUsersForOrderDelivery($mobilePhone, $totalAmountToPay, $orderID, $paymentMethod, $uid, $trackingNumber, $estimatedTimeOfDelivery)
  {
    try {

      //insert into notification node
      $userNotificationData = [
        'notificationMessage' => 'Your parcel with an order ID of ' . $orderID . ' is out for delivery.',
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
          'message' => 'ARFITCHECK: Your parcel with an order ID of ' . $orderID . ' with payment method ' . $paymentMethod . ' ' . $totalAmountToPay . ' PHP is out for delivery. Tracking # ' . $trackingNumber . ', EST Delivery Hrs: ' . $estimatedTimeOfDelivery . '. REMINDER: Once you received and accepted the product(s), please confirm it in ARFITCHECK Website, if we dont here from you, payment will be automatically transferred to BMIC.',
          'sendername' => env('SEMAPHORE_SENDER_NAME')
        ]
      ]);
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

  public function sendEmailForCancelRequestStatus($orderID, $uid, $email, $type, $recipient) {

    try {

      $status = $type === 'rejectCancelReq' ? 'was rejected. Order goes back to its original status.' : 'was approved. Your order has been moved to order history.';

      $emailNotificationData = [
        'subject' => 'Your order ' . $orderID . ' cancellation update.',
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
               <p>Your request to cancel <span class="order-id">' . $emailNotificationData['orderID'] . '</span> '. $emailNotificationData['status'] .' </p>
               
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
      
    }catch(\Exception $e) {
      return response($e->getMessage());
    }

  }

  public function automNotifyUsersWhenEstHrsMet()
  {
    try {
      foreach ($this->database->getReference('orders')->getSnapshot()->getValue() as $orderID => $orderInfo) {
        if ($orderInfo['orderStatus'] === 'Parcel out for delivery' && $orderInfo['associatedOrderID'] === $orderID && $orderInfo['isNotified'] === false) {
          $uid = $orderInfo['uid'];

          $user = $this->database->getReference('users/' . $uid)->getSnapshot()->getValue();

          if ($user) {
            $email = $user['email'];
            $firstName = $user['firstName'];
            $lastName = $user['lastName'];
            $phoneNumber = $user['mobileNumber'];

            $fullAddress = $orderInfo['fullShippingAddress'];
            $orderDate = $orderInfo['orderDate'];
            $subtotal = $orderInfo['amountToPay'] - 100;
            $type = 'deliver';
            $trackingNumber = $orderInfo['trackingNumber'];

            //we need to set a flag so that it wont notify the user again
            $this->database->getReference('orders/' . $orderID)->update(['isNotified' => true]);
          }

          $this->sendEmailForDeliveryNotification(
            $orderID,
            $email,
            $firstName,
            $lastName,
            $orderDate,
            $subtotal,
            $phoneNumber,
            $fullAddress,
            $type,
            $trackingNumber
          );
        }
      }

      return response()->json([
        'messaeg' => 'Email Sent!'
      ]);
    } catch (\Exception $e) {
      return response($e->getMessage());
    }
  }

  public function sendEmailNotificationForReceipt($orderID, $email, $firstName, $lastName, $orderDate, $subtotal, $phoneNumber, $fullAddress, $type, $trackingNumber, $estimatedTimeOfDelivery)
  {
    try {

      $status = $type == 'place' ? 'has been received. Kindly wait until BMIC confirmed your order(s).' : ($type == 'confirm' ? 'has been confirmed. BMIC has been notified to start preparing and shipping your item(s).' :
        'is now out for delivery. REMINDER: Once you received your item(s), please confirm it in the ARFITCHECK Website, if we dont hear from you, payment will be automatically transferred to BMIC.'
      );

      $subjectStatus = $type == 'place' ? 'has been received by the system.' : ($type == 'confirm' ? 'has been confirmed.' :
        'is now out for delivery.'
      );

      $estTimeManipulator = $estimatedTimeOfDelivery === 1 ? '1 - 2' : ($estimatedTimeOfDelivery === 2 ? '2 - 3' : ($estimatedTimeOfDelivery === 3 ? '3 - 4' : ($estimatedTimeOfDelivery === 4 ? '4 - 5' : '5+')));

      $emailNotificationData = [
        'subject' => 'Your order ' . $orderID . ' ' . $subjectStatus,
        'email' =>  $email,
        'status' => $status,
        'orderID' => $orderID,
        'orderDate' => $orderDate,
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
               <p>Your order request with an order ID of <span class="order-id">' . $emailNotificationData['orderID'] . '</span> ' . $emailNotificationData['status'] . '</p>
               
               <div class="divider"></div>
         
               <h3>ORDER DETAILS</h3>
               <p><strong>Order ID:</strong> ' . $emailNotificationData['orderID'] . '</p>
               <p><strong>Order Date:</strong> ' . $emailNotificationData['orderDate'] . '</p>
               
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
               <p>Kindly wait for your shipment. Once you receive and accept the product(s), kindly confirm this in ARFITCHECK Web.</p>
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

  public function sentNotificationIfAdminCancelOrder($orderID, $email, $firstName, $lastName, $orderDate, $subtotal, $phoneNumber, $fullAddress, $cancelReason, $cancelReasonAdditional)
  {
    try {

      $emailNotificationData = [
        'subject' => 'Your order ' . $orderID . ' ' . 'has been cancelled.',
        'email' =>  $email,
        'status' => 'has been cancelled due to the following reason, "' . $cancelReason . '". If your chosen method for this order was E-Wallet kindly wait for BMIC to return your payment within 2 - 3 business days, if you haven\'t receive your payment within the said timeframe, you may contact BMIC through their Facebook page.',
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
               <p>Your order request with an order ID of <span class="order-id">' . $emailNotificationData['orderID'] . '</span> ' . $emailNotificationData['status'] . '</p>
               
               <div class="divider"></div>
         
               <h3>ORDER DETAILS</h3>
               <p><strong>Order ID:</strong> ' . $emailNotificationData['orderID'] . '</p>
               <p><strong>Order Date:</strong> ' . $emailNotificationData['orderDate'] . '</p>
               
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

  public function sendEmailNotificationForAdminIfCancelRequest($requestID)
  {
      try {

          $emailNotificationData = [
              'subject' => 'A customer requested to cancel a order with order ID ' . $requestID . '.',
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
                      
                      <p>A customer requested to cancel a order with an order ID of <span class="order-id">' . $emailNotificationData['requestID'] . '</span>. 
                      
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
                ? 'an order has been placed.'
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
                'subject' => 'A order with order ID ' . $requestID . ' ' . $subjectStatus,
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
                        <p><strong>Order ID:</strong> ' . $emailNotificationData['requestID'] . '</p>
                        <p><strong>Order Date:</strong> ' . $emailNotificationData['requestDate'] . '</p>
                        
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
  // this function is what is being called if the admin clicked the "Notfy User"
  public function sendEmailForDeliveryNotification($orderID, $email, $firstName, $lastName, $orderDate, $subtotal, $phoneNumber, $fullAddress, $type, $trackingNumber)
  {
    try {

      $status = $type == 'place' ? 'has been received. Kindly wait until BMIC confirmed your order(s).' : ($type == 'confirm' ? 'has been confirmed. BMIC will now start preparing your item(s).' :
        'is now out for delivery. REMINDER: Once you received your item(s), please confirm it in the ARFITCHECK Website, if we dont hear from you, payment will be automatically transferred to BMIC.'
      );

      $emailNotificationData = [
        'subject' => 'Your order ' . $orderID . ' has been delivered.',
        'email' =>  $email,
        'status' => $status,
        'orderID' => $orderID,
        'orderDate' => $orderDate,
        'subtotal' => $subtotal,
        'phoneNumber' => $phoneNumber,
        'trackingNumber' => $trackingNumber,
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
               <p>Your order request with an order ID of <span class="order-id">' . $emailNotificationData['orderID'] . '</span> has been delivered. Once you received your product(s) kindly CONFIRM it on the ARFITCHECK Website by ' .  Carbon::now()->addDay(2)->toDateString() . ', if we did not hear from you, payment will be automatically transferred to BMIC.  </p>

               <div class="divider"></div>
               <h3>I HAVE A PROBLEM WITH THE PRODUCT I RECEIVED</h3>
               <p>For any problems about your order, kindly contact BMIC through their page, <a href="https://www.facebook.com/bmic.clothing" target="_blank">BMIC Facebook Page</a></p>
               
               <div class="divider"></div>
         
               <h3>ORDER DETAILS</h3>
               <p><strong>Order ID:</strong> ' . $emailNotificationData['orderID'] . '</p>
               <p><strong>Order Date:</strong> ' . $emailNotificationData['orderDate'] . '</p>
               
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
         
               <div class="divider"></div>
         
               <h3>WHAT\'S NEXT</h3>
               <p>Kindly wait for your shipment. Once you receive and accept the product(s), kindly confirm this in ARFITCHECK Web. If we dont hear from you, the payment will be automatically transferred to BMIC.</p>
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
}
