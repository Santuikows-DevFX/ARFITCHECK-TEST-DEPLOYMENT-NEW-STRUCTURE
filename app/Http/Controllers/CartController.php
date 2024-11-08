<?php

namespace App\Http\Controllers;

use Google\Cloud\Storage\Connection\Rest;
use Illuminate\Http\Request;
use Illuminate\Support\Testing\Fakes\Fake;
use Kreait\Firebase\Contract\Database;
use Kreait\Laravel\Firebase\Facades\Firebase;
use Kreait\Firebase\Storage;

class CartController extends Controller
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


    public function fetchMyCartItems(Request $request)
    {
        try {

            $cartItems = [];
            //select all the cart items based on the id shit
            if ($this->database->getReference('cart')->getSnapshot()->hasChildren() && $this->database->getReference('cart')->getSnapshot()->exists()) {
                foreach ($this->database->getReference('cart')->getSnapshot()->getValue() as $cartProductInfo) {

                    if ($cartProductInfo['uid'] == $request->uid) {
                        $cartItems[] = $cartProductInfo;
                    }
                }
                return response()->json($cartItems);
            } else {

                $message = "No Cart Items";
                return response(compact('message'));
            }
        } catch (\Exception $e) {

            return response()->json([
                'message' => $e->getMessage()
            ]);
        }
    }

    public function insertCartItems(Request $request)
    {
        $productTotalPrice = $request->productQuantity * $request->productPrice;

        $cartProductData = [
            'productImage' => $request->productImage,
            'productName' => $request->productName,
            'productCategory' => $request->productCategory,
            'productSize' => $request->productSize,
            'productPrice' => $request->productPrice,
            'productQuantity' => $request->productQuantity,
            'productTotalPrice' => $productTotalPrice,
            'maximumQuantity' => $request->maximumQuantity,
            'uid' => $request->uid
        ];

        $cartRef = $this->database->getReference('cart');

        if ($cartRef->getSnapshot()->exists() && $cartRef->getSnapshot()->hasChildren()) {
            foreach ($cartRef->getSnapshot()->getValue() as $key => $cartInfo) {
                if (
                    $request->productName == $cartInfo['productName'] &&
                    $request->productSize == $cartInfo['productSize'] &&
                    $request->uid == $cartInfo['uid']
                ) {
                    $newQuantity = $cartInfo['productQuantity'] + $request->productQuantity;

                    if ($newQuantity > $cartInfo['maximumQuantity']) {
                        $message = "You cannot add more of this product. Maximum quantity reached!";
                        return response(compact('message'));
                    }

                    $newTotalPrice = $newQuantity * $request->productPrice;

                    $cartRef->getChild($key)->update([
                        'productQuantity' => $newQuantity,
                        'productTotalPrice' => $newTotalPrice
                    ]);

                    $message = "Added to Cart!";
                    return response(compact('message'));
                }
            }
        }

        $cartRef->push($cartProductData);
        $message = "Added to Cart!";
        return response(compact('message'));
    }

    public function removeFromCart(Request $request)
    {
        foreach ($this->database->getReference('cart')->getSnapshot()->getValue() as $cartID => $cartInfo) {
            if (
                $request->productName == $cartInfo['productName'] &&
                (
                    $cartInfo['productCategory'] === 'Caps' || $request->productSize == $cartInfo['productSize']
                ) &&
                $request->uid == $cartInfo['uid']
            ) {
                $this->database->getReference('cart/' . $cartID)->remove();
                $message = "Product Removed from Cart";
                return response(compact('message'));
            }
        }

        $message = "Product not found in cart";
        return response(compact('message'));
    }

    public function updateCart(Request $request)
    {

        foreach ($this->database->getReference('cart')->getSnapshot()->getValue() as $cartID => $cartInfo) {
            if ($request->uid === $cartInfo['uid'] && $request->productName === $cartInfo['productName']) {

                $this->database->getReference('cart/' . $cartID . '/productQuantity')->set($request->newQuantity);
                $newProductTotalPrice = $request->newQuantity * $cartInfo['productPrice'];
                $this->database->getReference('cart/' . $cartID . '/productTotalPrice')->set($newProductTotalPrice);
            }
        }
    }
}
