<?php

namespace App\Http\Controllers;

use GuzzleHttp\Client;
use Illuminate\Http\Request;
use Kreait\Firebase\Contract\Database;
use Kreait\Laravel\Firebase\Facades\Firebase;
use Kreait\Firebase\Storage;


class SizeController extends Controller
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

    public function insertClothingSize(Request $request)
    {
        try {

            $clothingSizeData = [

                'size' => $request->size,
                'width' => $request->width,
                'sleeves' => $request->sleeves,
                'length' => $request->length,
                'centiWidth' => $request->centiWidth,
                'centiLength' => $request->centiLength,
                'centiSleeves' => $request->centiSleeves,
                'usSize' => $request->usSize,
                'euSize' => $request->euSize,
                'ukSize' => $request->ukSize,
                'category' => $request->category

                // 'size' => $request->size,
                // 'length' => $request->length,
                // 'waist' => $request->waist,
                // 'legHole' => $request->legHole,
                // 'centiLength' => $request->centiLength,
                // 'centiWaist' => $request->centiWaist,
                // 'centiLegHole' => $request->centiLegHole,
                // 'usSize' => $request->usSize,
                // 'euSize' => $request->euSize,
                // 'ukSize' => $request->ukSize,
            ];

            $this->database->getReference('sizes')->push($clothingSizeData);
            return response()->json([
                'message' => 'Size Inserted!'
            ]);
        } catch (\Exception $e) {
            return response($e->getMessage());
        }
    }


    public function fetchClothingSizes($category)
    {
        try {

            //get the sizes based on the category
            $clothingSizeData = [];
            foreach ($this->database->getReference('sizes')->getSnapshot()->getValue() as $sizeID => $sizeInfo) {
                if ($category == $sizeInfo['category']) {
                    $clothingSizeData[] = [

                        'sizeID' => $sizeID,
                        'sizeInfo' => $sizeInfo
                    ];
                }
            }

            return response()->json($clothingSizeData);
        } catch (\Exception $e) {
            return response($e->getMessage());
        }
    }

    public function updateClothingSize(Request $request)
    {
        try {

            $sizes = $this->database->getReference('sizes')->getSnapshot()->getValue();
            $sizeArrayReq = $request->all();

            foreach ($sizeArrayReq as $sizeDataReq) {
                if (isset($sizeDataReq['sizeID']) && isset($sizeDataReq['sizeInfo'])) {
                    foreach ($sizes as $sizeID => $sizeInfo) {
                        if ($sizeDataReq['sizeID'] == $sizeID) {
                            $clothingSizeUpdatedData = [];

                            // Check category and update accordingly
                            if ($sizeInfo['category'] == 'T-Shirt') {
                                $clothingSizeUpdatedData = [

                                    //for tshirt only
                                    'width' => $sizeDataReq['sizeInfo']['width'],
                                    'sleeves' => $sizeDataReq['sizeInfo']['sleeves'],
                                    'centiWidth' => $sizeDataReq['sizeInfo']['centiWidth'],
                                    'centiSleeves' => $sizeDataReq['sizeInfo']['centiSleeves'],
                                    'size' => $sizeDataReq['sizeInfo']['size'],
                                    'length' => $sizeDataReq['sizeInfo']['length'],
                                    'centiLength' => $sizeDataReq['sizeInfo']['centiLength'],
                                    'usSize' => $sizeDataReq['sizeInfo']['usSize'],
                                    'euSize' => $sizeDataReq['sizeInfo']['euSize'],
                                    'ukSize' => $sizeDataReq['sizeInfo']['ukSize'],
                                    'category' => $sizeDataReq['sizeInfo']['category']
                                ];
                            } else if ($sizeInfo['category'] == 'Shorts') {

                                $clothingSizeUpdatedData = [

                                    //for shorts only
                                    'waist' => $sizeDataReq['sizeInfo']['waist'],
                                    'legHole' => $sizeDataReq['sizeInfo']['legHole'],
                                    'centiLegHole' =>  $sizeDataReq['sizeInfo']['centiLegHole'],
                                    'centiWaist' => $sizeDataReq['sizeInfo']['centiWaist'],

                                    'length' => $sizeDataReq['sizeInfo']['length'],
                                    'centiLength' => $sizeDataReq['sizeInfo']['centiLength'],
                                    'size' => $sizeDataReq['sizeInfo']['size'],
                                    'usSize' => $sizeDataReq['sizeInfo']['usSize'],
                                    'euSize' => $sizeDataReq['sizeInfo']['euSize'],
                                    'ukSize' => $sizeDataReq['sizeInfo']['ukSize'],
                                    'category' => $sizeDataReq['sizeInfo']['category']
                                ];
                            } else {
                            }

                            if (!empty($updateData)) {
                                $this->database->getReference('sizes/' . $sizeDataReq['sizeID'])->update($updateData);
                            }

                            break;
                        }
                    }
                }
            }

            $message = 'Update Successfully!';
            return response()->json(compact('message'));
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()]);
        }
    }
}
