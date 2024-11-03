<?php

use App\Http\Controllers\CartController;
use App\Http\Controllers\CustomRequestController;
use App\Http\Controllers\DataController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SizeController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

//login endpoints
Route::prefix('auth')->controller(DataController::class)->group(function () {

    Route::get('/getUser/{uid}', 'getUserByID');
    Route::get('/getMyAddress/{uid}', 'getMyAddress');
    Route::get('/fetchMyNotifications/{uid}', 'getMyNotifications');

    Route::post('/updateAllNotifications/{uid}', 'updateAllNotifications');
    Route::delete('/deleteAllNotifications/{uid}', 'deleteAllNotifications');

    Route::post('/loginUser', 'loginUser');
    Route::post('/insertUser', 'registerUser');
    Route::post('/updateProfile', 'updateProfile');
    Route::post('/updateShippingDetails/{uid}', 'updateShippingDetails');
    Route::post('/updatePassword', 'updatePassword');
    Route::post('/forgotPasswordRequest', 'forgotPasswordRequest');

    Route::post('/uploadProfile', 'uploadProfile');
    Route::post('/getDownloadURL', 'getDownloadURL');

    // not Implemented pa yugn nasa baba
    Route::post('/deleteRegisterRequestAfterTenMinutes', 'deleteRegisterRequestAfterTenMinutes');
    Route::post('/resendCode', 'resendCode');

    //otp code routes
    Route::post('/updateVerificationCodeWhenExpired', 'updateVerificationCodeWhenExpired');
    Route::post('/resendVerificationCode', 'resendVerificationCode');
    Route::post('/sendOTPCodeToEmail', 'sendOTPCodeToEmail');

    //admin data fetching and inserting
    Route::get('/fetchAdminInfo', 'getAllAdmins');

    //adming notification route
    Route::get('/fetchAdminNotifications/{adminID}', 'getAdminNotifications');
    Route::post('/updateAllAdminNotification/{adminID}', 'updateAllAdminNotification');
    Route::delete('/deleteAllAdminNotification/{adminID}', 'deleteAllAdminNotification');

    Route::post('/addAdmin', 'addAdmin');
    Route::post('/deleteAdmin/{adminID}', 'deleteAdmin');

});

//product endpoints
Route::prefix('prd')->controller(ProductController::class)->group(function () {

    Route::get('/getProducts/{role}', 'fetchProducts');
    Route::get('/fetchProductByCateg/{role}/{category}', 'fetchProductByCateg');
    Route::get('/getProducts/{productName}', 'fetchProductByName');
    Route::get('/unlistedProducts', 'fetchUnlistedProducts');
    Route::get('/getCriticalLevel', 'fetchCriticalLevelProducts');
    Route::get('/getCategoryCount', 'getCategoryCount');


    Route::post('/insertProducts', 'insertProduct');
    Route::post('/editProduct', 'editProduct');
    Route::post('/getProductByCategory', 'getProductByCategory');
    Route::post('/getProductByPriceAndCategory', 'getProductByPriceAndCategory');
    Route::post('/getProductByPriceRange', 'getProductByPriceRange');

    //mobile routings
    Route::get('/fetchProductByID/{productID}', 'fetchProductByID'); //when the user clicked order now button in the mobile app 
});

//order endpoints
Route::prefix('order')->controller(OrderController::class)->group(function () {

    //admin side routes
    Route::get('/fetchOrders', 'fetchOrders');
    Route::get('/fetchCustomizationRequestOrders', 'fetchCustomizationRequestOrders');
    Route::get('/getReportsData', 'fetchReportsData');
    Route::get('/fetchTransactionHistory', 'fetchTransactionHistoryData');
    Route::get('/fetchCancelRequestOrders', 'fetchCancelRequestOrders');
    Route::get('/automNotifyUsersWhenEstHrsMet', 'automNotifyUsersWhenEstHrsMet');
    Route::get('/fetchOutForDeliveryOrders', 'fetchOutForDeliveryOrders');

    Route::get('/fetchTransactionHistoryDataByDate/{dateSortRequest}', 'fetchTransactionHistoryDataByDate');
    Route::get('/fetchOrdersByDate/{dateSortRequest}', 'fetchOrdersByDate');
    Route::get('/fetchCancelRequestOrdersByDate/{dataSortRequest}', 'fetchCancelRequestOrdersByDate');

    // ---

    Route::post('/rejectCancelRequest', 'rejectCancelOrderRequest');
    Route::post('/cancelOrderRequest', 'cancelOrderRequest');

    //user side routes
    Route::get('/fetchMyOrder/{uid}', 'fetchMyOrder');
    Route::get('/fetchCompletedOrder/{uid}', 'fetchOrderHistoryOrders');
    Route::get('/fetchCurrentOrderForReceipt/{uid}/{orderTimeStamp}', 'fetchCurrentOrderForReceipt');
    Route::get('/fetchMyAddress/{uid}', 'fetchMyAddress');
    Route::get('/fetchMyOrderByDate/{uid}/{dateSortRequest}', 'fetchMyOrderByDate');
    Route::get('/fetchMyOrderHistoryByDate/{uid}/{dateSortRequest}', 'fetchMyOrderHistoryByDate');

    Route::post('/placeOrder', 'placeOrder');
    Route::post('/updateOrder', 'updateOrderStatus');
    Route::post('/updateProductRatingBasedOnOrder', 'updateProductStarRating');
    Route::post('/receiveMyOrder', 'receiveMyOrder');
    // Route::post('/updateMyOrder/{orderID}', 'updateMyOrder');

    //mobile route
    Route::post('/singleProductPlaceOrder', 'singleProductPlaceOrder');
});

//cart endpoints
Route::prefix('cart')->controller(CartController::class)->group(function () {

    Route::post('/getMyCartItems', 'fetchMyCartItems');
    Route::post('/insertCartItems', 'insertCartItems');
    Route::post('/removeFromCart', 'removeFromCart');
    Route::post('/updateCart', 'updateCart');
});

//analytics endpoints
Route::prefix('rprt')->controller(ReportController::class)->group(function () {

    Route::get('/fetchSalesSummary', 'fetchSalesSummary');
    Route::post('/calculateAnalyticsReports', 'calculateAnalyticsReports');
});

//clothing size
Route::prefix('size')->controller(SizeController::class)->group(function () {

    Route::get('/fetchClothingSizes/{category}', 'fetchClothingSizes');

    Route::post('/updateClothingSize', 'updateClothingSize');

    //temp for inserting only
    Route::post('/insertClothingSize', 'insertClothingSize');
});

//custom prd req
Route::prefix('custom')->controller(CustomRequestController::class)->group(function () {

    Route::get('/fetchMyCustomizationRequests/{uid}', 'fetchMyCustomizationRequests');
    Route::get('/fetchCustomizationRequestForReceipt/{uid}/{orderTimeStamp}', 'fetchCustomizationRequestForReceipt');

    Route::post('/updateRequestWhenPaid', 'updateRequestWhenPaid');

    //admin
    Route::get('/fetchCustomizationRequest', 'fetchCustomizationRequest');
    Route::get('/fetchCustomizationRequestByDate/{dataSortRequest}', 'fetchCustomizationRequestByDate');
    Route::get('/fetchCustomizationCancelRequests', 'fetchCustomizationCancelRequests');

    Route::post('/updateRequest', 'updateRequestStatus');

    Route::post('/insertCustomizePrdRequest', 'insertCustomizePrdRequest');
    Route::post('/cancelCustomizationRequest', 'cancelCustomizationRequest');

    Route::post('/rejectCancelCustomizationRequest', 'rejectCancelCustomizationRequest');

    //test email notif
    Route::post('/sendEmailNotificationForAdminIfRequestPaid', 'sendEmailNotificationForAdminIfRequestPaid');
});
