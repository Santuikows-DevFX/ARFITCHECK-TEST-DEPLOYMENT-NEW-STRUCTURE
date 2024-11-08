# OLD INSERT CART ITEM FUNCTION (LARAVEL)

 // public function insertCartItems(Request $request)
    // {
    //     if ($this->database->getReference('cart')->getSnapshot()->exists() && $this->database->getReference('cart')->getSnapshot()->hasChildren()) {

    //         foreach ($this->database->getReference('cart')->getSnapshot()->getValue() as $cartInfo) {
    //             if ($request->productName == $cartInfo['productName'] && $request->uid == $cartInfo['uid']) {
    //                 $message = "Product is already in the cart ";
    //                 return response(compact('message'));
    //             } else {

    //                 $productTotalPrice = $request->productQuantity * $request->productPrice;
    //                 $cartProductData = [
    //                     'productImage' => $request->productImage,
    //                     'productName' => $request->productName,
    //                     'productCategory' => $request->productCategory,
    //                     'productSize' => $request->productSize,
    //                     'productPrice' => $request->productPrice,
    //                     'productQuantity' => $request->productQuantity,
    //                     'productTotalPrice' => $productTotalPrice,
    //                     'maximumQuantity' => $request->maximumQuantity,
    //                     'uid' => $request->uid
    //                 ];

    //                 $this->database->getReference('cart')->push($cartProductData);
    //                 $message = "Added to Cart!";
    //                 return response(compact('message'));
    //                 break;
    //             }
    //         }
    //     } else {
    //         $productTotalPrice = $request->productQuantity * $request->productPrice;
    //         $cartProductData = [
    //             'productImage' => $request->productImage,
    //             'productName' => $request->productName,
    //             'productCategory' => $request->productCategory,
    //             'productSize' => $request->productSize,
    //             'productPrice' => $request->productPrice,
    //             'productQuantity' => $request->productQuantity,
    //             'productTotalPrice' => $productTotalPrice,
    //             'maximumQuantity' => $request->maximumQuantity,
    //             'uid' => $request->uid
    //         ];

    //         $this->database->getReference('cart')->push($cartProductData);
    //         $message = "Added to Cart!";

    //         return response(compact('message'));
    //     }
    // }