<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use DateTime;
use GuzzleHttp\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Kreait\Firebase\Contract\Database;
use Kreait\Laravel\Firebase\Facades\Firebase;
use Illuminate\Support\Str;
use Kreait\Firebase\Exception\Auth\InvalidPassword;
use Kreait\Firebase\Exception\Auth\UserNotFound;

class DataController extends Controller
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

    //form login / signup functions

    public function loginUser(Request $request)
    {
        try {
            //check if user verified his/her account using email verify
            $user = $this->auth->signInWithEmailAndPassword($request->email, $request->password);
            $userData = $this->auth->getUser($user->firebaseUserId());
            if ($userData->emailVerified) {
                //get the fcking token
                $token = $user->idToken();

                //check if existing
                foreach ($this->database->getReference('users')->getSnapshot()->getValue() as $userID => $userInfo) {
                    if ($request->email == $userInfo['email']) {
                        $role = $userInfo['role'];
                        return response(compact('userInfo', 'token', 'userID', 'role'), 200);
                        break;
                    }
                }
            } else {
                $message = "Email must be verified before proceeding to login!";
                return response(compact('message'));
            }
        } catch (InvalidPassword $e) {
            $message = $e->getMessage();
            return response(compact('message'));
        } catch (\Exception $e) {
            $message = $e->getMessage();
            return response(compact('message'));
        }
    }

    public function registerUser(Request $request)
    {
        //updated
        try {

            $user = "";
            $message = "";
            $defProfile = 'https://storage.googleapis.com/arfit-check-db.appspot.com/profiles/defaultProfile.jpg?GoogleAccessId=firebase-adminsdk-j3jm3%40arfit-check-db.iam.gserviceaccount.com&Expires=32503680000&Signature=OzbKZvJiDfZLc8DRhcByxambejjocucy5YUAM72VjFOq5z420znGa2MnZVE2Ia6iStTK7hU7a%2BcSC%2B4IjfRBjo%2BaJa4Mm7BJGbJ%2FtlnG4LTFJy%2FwWivU2PT5bRyqHVRN2kYlYtKQ61LkSGN6IvziGTd207RNd1nxar151292LWkNSfRgb8ylgUCrMpBOR%2Boprfk6jwuv1mZ6x7ToJG4TViHp5k95Izzn80bQIpBbGkNmP6Yk0MPuusVlw%2Bq%2BHpiWejIffTYwzhKh%2BPGzqTu3n9DbT5XzfDP%2FZnpCHzFpHgzsUXN5bHZdd%2BNnK%2BjL37XvrTFk6p6QAiRMRupU0YHU8A%3D%3D';

            if ($request->requestType === 'VERIFY') {

                $isExisting = false;

                foreach ($this->database->getReference('users')->getSnapshot()->getValue() as $userID => $userInfo) {

                    if($request->mobilePhone === $userInfo['mobileNumber'] && $request->email === $userInfo['email']) {
                        $message = 'The email and number is both used, please try another email and mobile number.';
                        $isExisting = true;
                        break;
                    }

                    if ($request->mobilePhone === $userInfo['mobileNumber']) {
                        $message = 'The number is already used, please try another mobile number.';
                        $isExisting = true;
                        break;
                    }

                    if ($request->email === $userInfo['email']) {
                        $message = 'The email is already used, please try another email.';
                        $isExisting = true;
                        break;
                    }
                }

                if (!$isExisting) {
                    $this->createUserEmailAndPass(
                        $request->email,
                        $request->password,
                        $request->mobilePhone,
                        $request->firstName,
                        $request->lastName,
                        $defProfile,
                        $request->address,
                        $request->barangay,
                        $request->city,
                        $request->postalCode
                    );
                }
            } else {

                $user = $this->auth->signInWithEmailAndPassword($request->email, $request->password);
                $userData = $this->auth->getUser($user->firebaseUserId());

                foreach ($this->database->getReference('users')->getSnapshot()->getValue() as $userID => $userInfo) {

                    if (!$userData->emailVerified) {
                        $message = 'Email is not yet verified!';
                    }

                    if ($request->email === $userInfo['email'] && $request->otpCode != $userInfo['verificationCode']) {
                        $message = 'Incorrect OTP Code!';
                    }

                    if ($request->email === $userInfo['email'] && $request->otpCode === $userInfo['verificationCode'] && $userData->emailVerified) {

                        $token = $user->idToken();
                        $role = $userInfo['role'];
                        $this->database->getReference('users/' . $userID)->update([

                            'uid' => $userInfo['uid'],
                            'firstName' => $userInfo['firstName'],
                            'lastName' => $userInfo['lastName'],
                            'email' => $userInfo['email'],
                            'password' => $userInfo['password'],
                            'profileImage' => $userInfo['profileImage'],
                            'mobileNumber' => $userInfo['mobileNumber'],
                            'isVerified' => true,
                            'role' => 'user'

                        ]);

                        $message = "Goods";
                        return response(compact('userInfo', 'token', 'userID', 'role', 'message'));

                        break;
                    }
                }
            }
            return response(compact('message'));
        } catch (\Exception $e) {

            $message = $e->getMessage();
            return response(compact('message'));
        }
    }

    public function createUserEmailAndPass($email, $password, $mobilePhone, $firstName, $lastName, $defProfile, $address, $barangay, $city, $postalCode)
    {
        try {

            $user = $this->auth->createUserWithEmailAndPassword($email, $password);
            $this->auth->sendEmailVerificationLink($email);

            // $smsCodeForMobile =  $this->sendSMSCode($mobilePhone);

            $signUpDataRaw = [
                'uid' => $user->uid,
                'firstName' => $firstName,
                'lastName' => $lastName,
                'email' => $email,
                'password' => bcrypt($password),
                'profileImage' => $defProfile,
                'mobileNumber' => $mobilePhone,
                'verificationCode' => '',
                'isVerified' => false,
                'role' => 'user'
            ];

            $this->database->getReference('users')->push($signUpDataRaw);

            //fetch the uid for to push to an address
            foreach ($this->database->getReference('users')->getSnapshot()->getValue() as $userID => $userInfo) {
                if ($email == $userInfo['email']) {

                    $fullAddress = $address . ' - ' . $barangay . ', ' . $city . ', ' . $postalCode . ', ' . 'Phillipines';
                    $addressInfo = [

                        'recipientName' => $firstName . ' ' . $lastName,
                        'fullAddress' => $fullAddress,
                        'addressLine' => $address,
                        'province' => 'Metro Manila',
                        'barangay' => $barangay,
                        'city' => $city,
                        'postalCode' => $postalCode,
                        'country' => 'Philippines',
                        'uid' => $userID
                    ];

                    $this->database->getReference('shippingdetails')->push($addressInfo);
                    break;
                }
            }
        } catch (\Exception $e) {
            return response($e->getMessage());
        }
    }


    public function sendSMSCode($mobilePhone)
    {
        try {

            $smsCodeForMobile =  rand(100000, 999999);
            $webClient = new Client();

            $webClient->post('https://semaphore.co/api/v4/messages', [
                'form_params' => [
                    'apikey' => env('SEMAPHORE_API_KEY'),
                    'number' => $mobilePhone,
                    'message' => 'ARFITCHECK: Your OTP Code is ' . $smsCodeForMobile . ' Valid for only 10 mins NEVER share your code to anyone else including the BMIC Staff.',
                    'sendername' => env('SEMAPHORE_SENDER_NAME')
                ]
            ]);
        } catch (\Exception $e) {
            return response($e->getMessage());
        }

        return $smsCodeForMobile;
    }

    public function updateVerificationCodeWhenExpired(Request $request)
    {
        try {

            //fetch the specific user based on the email being used upon registration.
            foreach ($this->database->getReference('users')->getSnapshot()->getValue() as $unverifiedUserID => $unverifiedUserInfo) {
                if ($request->email == $unverifiedUserInfo['email']) {
                    $this->database->getReference('users/' . $unverifiedUserID . '/verificationCode')
                        ->set("");
                }
            }
        } catch (\Exception $e) {
            return response($e->getMessage());
        }
    }

    public function resendVerificationCode(Request $request)
    {
        try {
            //fetch the user based on the email used upon registration.
            foreach ($this->database->getReference('users')->getSnapshot()->getValue() as $unverifiedUserID => $unverifiedUserInfo) {
                if ($request->email == $unverifiedUserInfo['email']) {

                    //generate new SMS Code and resend it via SMS Notif.
                    $newSMSVerifiationCode = $this->sendSMSCode($unverifiedUserInfo['mobileNumber']);

                    $this->database->getReference('users/' . $unverifiedUserID . '/verificationCode')
                        ->set($newSMSVerifiationCode);
                }
            }

            $message = 'Code Resent Successfully!';
            return response(compact('message'));
        } catch (\Exception $e) {
            return response($e->getMessage());
        }
    }

    //forgot password 
    public function forgotPasswordRequest(Request $request)
    {
        $message = '';

        try {
            //check if the email exists in the database, meaning if it exists there is an account registered to that email
            $user = $this->auth->getUserByEmail($request->email);

            //send the password reset link to the provided email
            $this->auth->sendPasswordResetLink($request->email);
            $message = 'A password reset link has been sent to ' . '' . $request->email;
            return response(compact('message'));
        } catch (UserNotFound $e) {
            //email does not exists in the firebase auth
            $message = 'Email does not exists!';
            return response(compact('message'));
        } catch (\Exception $e) {
            $message = $e->getMessage();
            return response(compact('message'));
        }
    }

    //---------------------------------------------------

    public function getDownloadURL(Request $request)
    {

        try {

            $path = 'profiles/' . '' . $request->imageName;

            $expiration = new \DateTime('now', new \DateTimeZone('UTC'));
            $expiration->modify('+1 hour');

            $downloadURL = $this->storage->getBucket()->object($path)->signedUrl(new \DateTime('3000-01-01T00:00:00Z'));

            return response()->json([
                'downloadURL' => $downloadURL
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ]);
        }
    }

    public function getUserByID(Request $request)
    {
        $data = $this->database->getReference('users/' . $request->uid)->getValue();
        return response()->json($data);
    }

    public function getMyAddress(Request $request)
    {
        foreach ($this->database->getReference('shippingdetails')->getSnapshot()->getValue() as $shippingInfo) {
            if ($request->uid == $shippingInfo['uid']) {
                return response()->json($shippingInfo);
                break;
            }
        }
    }

    public function getMyNotifications($uid)
    {
        //fetch the notification based on the uid
        $notificationData = [];
        $notificationCount = 0;
        if ($this->database->getReference('notificationForUsers')->getSnapshot()->exists()) {
            foreach ($this->database->getReference('notificationForUsers')->getSnapshot()->getValue() as $notificationID => $notificationInfo) {
                if ($uid == $notificationInfo['uid']) {

                    if ($notificationInfo['status'] == 'unread') {
                        //increase the notification count per loop
                        $notificationCount++;
                    }

                    $notificationData[] = [
                        'notificationID' => $notificationID,
                        'notificationMessage' => $notificationInfo['notificationMessage'],
                        'notificationDate' => $notificationInfo['notificationDate'],
                        'notificationTime' => $notificationInfo['notificationTime'],
                        'notificationCount' => $notificationCount,
                        'notificationStatus' => $notificationInfo['status']
                    ];
                }
            }
        }

        return response()->json($notificationData);
    }

    //----------------------------------

    public function uploadProfile(Request $request)
    {
        try {

            $file = $request->file('file');
            $filename = 'profiles/' . '' . $file->getClientOriginalName();

            $this->storage->getBucket()->upload($file->getContent(), [
                'name' => $filename
            ]);

            return response()->json([
                'message' => 'File Uploaded'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ]);
        }
    }

    //----------------------------------

    public function updateProfile(Request $request)
    {
        try {

            //find the user
            $message = '';
            foreach ($this->database->getReference('users')->getSnapshot()->getValue() as $userID => $userInfo) {
                if ($request->uid === $userID) {
                    if ($request->requestType == 'newEmail') {

                        //updating the email only so the pass wont be affected.
                        $this->auth->updateUser($userInfo['uid'], [
                            'email' => $request->email
                        ]);

                        $this->auth->sendEmailVerificationLink($request->email);

                        $this->database->getReference('users/' . $userID)->update([

                            'firstName' => $request->firstName,
                            'lastName' => $request->lastName,
                            'email' => $request->email,
                            'mobileNumber' => $request->mobileNumber,
                            'password' => $userInfo['password'],
                            'profileImage' => $userInfo['profileImage'],
                            'role' => $userInfo['role'],
                            'uid' => $userInfo['uid']
                        ]);

                        $message = "Updated Successfully! Login with your new email";
                    } else if ($request->requestType == 'newPhone') {

                        $numberExists = false;

                        foreach ($this->database->getReference('users')->getSnapshot()->getValue() as $userID => $userInfo) {
                            if ($request->mobileNumber === $userInfo['mobileNumber']) {
                                $message = 'The number is already used, please try another mobile number';
                                $numberExists = true;
                                break;
                            } else {
                            }
                        }

                        if (!$numberExists) {
                            $smsCode = $this->sendSMSCode($request->mobileNumber);

                            $this->database->getReference('users/' . $userID)->update([
                                'verificationCode' => $smsCode,
                            ]);

                            $message = 'VerifyPhone';
                        }
                    } else if ($request->requestType == 'verifyNewPhone') {

                        foreach ($this->database->getReference('users')->getSnapshot()->getValue() as $userID => $userInfo) {

                            if ($request->email === $userInfo['email'] && $request->otpCode != $userInfo['verificationCode']) {
                                $message = 'Incorrect OTP Code!';
                            }

                            if ($request->email === $userInfo['email'] && $request->otpCode === $userInfo['verificationCode']) {

                                $this->database->getReference('users/' . $userID)->update([
                                    'mobileNumber' => $request->mobileNumber
                                ]);

                                $message = "Updated Successfully!";
                                break;
                            }
                        }
                    } else {

                        $this->database->getReference('users/' . $userID)->update([

                            'firstName' => $request->firstName,
                            'lastName' => $request->lastName,
                            'email' => $request->email,
                            'mobileNumber' => $request->mobileNumber,
                            'password' => $userInfo['password'],
                            'profileImage' => $userInfo['profileImage'],
                            'role' => $userInfo['role'],
                            'uid' => $userInfo['uid']
                        ]);

                        $message = "Updated Successfully!";
                    }
                }
            }

            return response(compact('message'));
        } catch (\Exception $e) {
            $message = $e->getMessage();
            return response(compact('message'));
        }
    }

    public function updateShippingDetails(Request $request)
    {

        foreach ($this->database->getReference('shippingdetails')->getSnapshot()->getValue() as $shippingID => $shippingInfo) {
            if ($request->uid == $shippingInfo['uid']) {

                $fullAddress = $request->address . ' - ' . $request->barangay . ', ' . $request->city . ', ' . $request->postalCode . ', ' . 'Phillipines';
                $this->database->getReference('shippingdetails/' . $shippingID)->update([

                    'recipientName' => $request->recipientName,
                    'fullAddress' => $fullAddress,
                    'addressLine' => $request->address,
                    'barangay' => $request->barangay,
                    'city' => $request->city,
                    'postalCode' => $request->postalCode,
                    'country' => 'Philippines',
                    'province' => $request->province,
                    'uid' => $request->uid
                ]);
                $message = "Updated Succesfully!";
                return response(compact('message'));
                break;
            }
        }
    }

    public function updatePassword(Request $request)
    {
        $message = '';
        try {

            foreach ($this->database->getReference('users')->getSnapshot()->getValue() as $userID => $userInfo) {
                if ($request->uid === $userID) {
                    if (Hash::check($request->oldPassword, $userInfo['password'])) {

                        //update the firebase authentication
                        $this->auth->changeUserPassword($userInfo['uid'], $request->newPassword);

                        $this->database->getReference('users/' . $userID)->update([
                            'firstName' => $userInfo['firstName'],
                            'lastName' => $userInfo['lastName'],
                            'mobileNumber' => $userInfo['mobileNumber'],
                            'password' => bcrypt($request->newPassword),
                            'profileImage' => $userInfo['profileImage'],
                            'role' => $userInfo['role'],
                            'uid' => $userInfo['uid']
                        ]);

                        
                        $message = "Password Updated Successfully!";
                    } else {
                        $message = "Incorrect Old Password";
                    }
                }
            }

            return response(compact('message'));
        } catch (\Exception $e) {
            $message = $e->getMessage();
            return response(compact('message'));
        }
    }

    public function updateAllNotifications($uid)
    {
        try {

            //loop to find the specific user based on the uid
            foreach ($this->database->getReference('notificationForUsers')->getSnapshot()->getValue() as $notificationID => $notificationInfo) {
                if ($uid == $notificationInfo['uid'] && $notificationInfo['status'] == 'unread') {
                    //update all the status to read
                    $this->database->getReference('notificationForUsers/' . $notificationID . '/status')
                        ->set('read');
                }
            }

            $message = 'Notifications Updated Successfully!';
            return response(compact('message'));
        } catch (\Exception $e) {
            return response($e->getMessage());
        }
    }

    public function deleteAllNotifications($uid)
    {
        try {

            foreach ($this->database->getReference('notificationForUsers')->getSnapshot()->getValue() as $deleteNotificationInfo) {
                if ($uid == $deleteNotificationInfo['uid']) {
                    //delete all the notification from this user
                    $this->database->getReference('notificationForUsers')->remove();
                }
            }
        } catch (\Exception $e) {
            return response($e->getMessage());
        }
    }

    //admin data
    public function addAdmin(Request $request)
    {
        try {
            $adminDefaultIconURL = "https://storage.googleapis.com/arfit-check-db.appspot.com/profiles/Icon.png?GoogleAccessId=firebase-adminsdk-j3jm3%40arfit-check-db.iam.gserviceaccount.com&Expires=32503680000&Signature=O%2F1tLuD5AGzq%2BS1CK%2FHeRl6zvfdo%2FNskPPkp0SDbbsG6toQc%2BHKul%2BuJoCHHB5xbGuo5fupDinpsezfVZL2P3GJimQhe%2BCTjr%2FV3IMYHcV1iB8TApFzsU63WxSOS3%2FPfJtx%2BooYye4TQPm6K0atkVcmo4GQUX%2FobbaxhZr4SENeJ4r8%2Bs5hjkHzgQ2Nc%2Fkt96wAzPU4ulBwT%2BYNofrYopIKAu%2BbGxX38%2FMj3I3lE6R1QLwVjcrKikJQ3QA%2B6ysdNSfFRZUjxW%2B7e3JjxIcJJc4gOthBMekUjhuluf8Zen6ZFY8EulSSCWrylVKFZ6G6TijjXedD2RMdAPl7pU2LErQ%3D%3D";

            $admin = $this->auth->createUserWithEmailAndPassword($request->email, $request->password);
            $this->auth->sendEmailVerificationLink($request->email);

            $adminData = [

                'firstName' => $request->firstName,
                'lastName' => $request->lastName,
                'email' => $request->email,
                'password' => bcrypt($request->password),
                'mobileNumber' => $request->mobileNumber,
                'profileImage' => $adminDefaultIconURL,
                'role' => 'admin',
                'uid' => $admin->uid
            ];

            $this->database->getReference('users')->push($adminData);
            $message = 'Admin Added Successfully!';

            return response(compact('message'));
        } catch (\Exception $e) {
            $message = $e->getMessage();
            return response(compact('message'));
        }
    }

    public function getAllAdmins()
    {
        $adminData = [];
        foreach ($this->database->getReference('users')->getSnapshot()->getValue() as $adminID =>  $adminInfo) {
            if ($adminInfo['role'] === 'admin') {

                $adminData[] = [
                    'adminID' => $adminID,
                    'adminPassEncrypted' => Str::limit(bcrypt($adminInfo['password']), 20, ''),
                    'adminPass' => $adminInfo['password'],
                    'adminInfo' => $adminInfo
                ];
            }
        }

        return response()->json($adminData);
    }

    public function getAdminNotifications($adminID)
    {
        //getting the notification based on the admin id
        $adminNotificationData = [];
        $adminNotificationCount = 0;
        foreach ($this->database->getReference('notificationForAdmins')->getSnapshot()->getValue() as $adminNotificationID => $adminNotificationInfo) {

            if ($adminID == $adminNotificationInfo['adminID']) {

                //check the notification children for any notifications that are unread to increase the count of the notification
                if ($adminNotificationInfo['status'] == 'unread') {
                    //each loop increase the count
                    $adminNotificationCount++;
                }

                $adminNotificationData[] = [
                    'notificationID' => $adminNotificationID,
                    'notificationMessage' => $adminNotificationInfo['notificationMessage'],
                    'notificationDate' => $adminNotificationInfo['notificationDate'],
                    'notificationTime' => $adminNotificationInfo['notificationTime'],
                    'notificationCount' => $adminNotificationCount,
                    'notificationStatus' => $adminNotificationInfo['status']
                ];
            }
        }

        return response()->json($adminNotificationData);
    }

    public function deleteAdmin(Request $request)
    {

        //get by ID
        try {

            foreach ($this->database->getReference('users')->getSnapshot()->getValue() as $adminID => $adminInfo) {
                if ($request->adminID === $adminID) {

                    //delete the email shit on fb authentication based on uid
                    $this->auth->deleteUser($adminInfo['uid']);

                    $this->database->getReference('users/' . $request->adminID)->remove();
                    $message = 'Admin Removed!';

                    return response(compact('message'));
                }
            }
        } catch (\Exception $e) {
            $message = $e->getMessage();
            return response(compact('message'));
        }
    }

    public function deleteAllAdminNotification($adminID)
    {
        try {

            foreach ($this->database->getReference('notificationForAdmins')->getSnapshot()->getValue() as $deleteAdminNotificationID =>  $deleteAdminNotificationInfo) {
                if ($adminID == $deleteAdminNotificationInfo['adminID']) {
                    //delete all the notification from this user
                    $this->database->getReference('notificationForAdmins/' . $deleteAdminNotificationID)->remove();
                }
            }
        } catch (\Exception $e) {
            return response($e->getMessage());
        }
    }

    public function updateAllAdminNotification($adminID)
    {
        try {

            foreach ($this->database->getReference('notificationForAdmins')->getSnapshot()->getValue() as $adminNotificationID => $adminNotificationInfo) {
                if ($adminID == $adminNotificationInfo['adminID'] && $adminNotificationInfo['status'] == 'unread') {
                    //update the admin notification per based on admin id
                    $this->database->getReference('notificationForAdmins/' . $adminNotificationID . '/status')
                        ->set('read');
                }
            }
        } catch (\Exception $e) {
            return response($e->getMessage());
        }
    }
    
}
