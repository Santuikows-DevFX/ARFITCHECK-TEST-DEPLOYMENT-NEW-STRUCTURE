<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Kreait\Firebase\Contract\Database;
use Kreait\Laravel\Firebase\Facades\Firebase;
use Kreait\Firebase\Storage;

class ReportController extends Controller
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

    public function calculateAnalyticsReports(Request $request)
    {
        if ($this->database->getReference('orders')->getSnapshot()->exists()) {
            if ($request->dataSort === 'Daily') {
                return $this->dailyRevenue();
            } else if ($request->dataSort === 'Weekly') {
                return $this->weeklyRevenue();
            } else if ($request->dataSort === 'Monthly') {
                return $this->montlyRevenue();
            } else {
                return $this->yearlyRevenue();
            }
        }
    }

    public function dailyRevenue()
    {
        $todaysRevenue = 0;
        $yesterDaysRevenue = 0;

        $dailyRevenue = [];

        foreach ($this->database->getReference('orders')->getSnapshot()->getValue() as $dailyRevenueInfo) {

            //get waiting for confirmation only since the user send the payment receipt before placing the order
            if ($dailyRevenueInfo['orderDate'] === Carbon::now()->toDateString() && $dailyRevenueInfo['orderStatus'] === 'Order Completed') {
                $todaysRevenue += $dailyRevenueInfo['amountToPay'];
            }

            if ($dailyRevenueInfo['orderDate'] === Carbon::now()->subDay()->toDateString() && $dailyRevenueInfo['orderStatus'] === 'Order Completed') {
                $yesterDaysRevenue += $dailyRevenueInfo['amountToPay'];
            }
        }

        $dailyRevenue[] = [
            'currentRevenue' => $todaysRevenue > 0 ? $todaysRevenue : 0,
            'pastRevenue' => $yesterDaysRevenue > 0 ? $yesterDaysRevenue : 0
        ];

        return response()->json($dailyRevenue);
    }

    public function weeklyRevenue()
    {
        $currentWeekRevenue = [];
        $currSales = 0;
        $currSalesWithEwallet = 0;

        $lastWeekRevenue = [];
        $pastSales = 0;
        $pastSalesWithEwallet = 0;

        $startOfCurrentWeek = Carbon::now()->startOfWeek(Carbon::MONDAY);
        $startOfLastWeek = Carbon::now()->subWeek()->startOfWeek(Carbon::MONDAY);

        $endOfCurrentWeek = Carbon::now()->endOfWeek(Carbon::SUNDAY);
        $endOfLastWeek = Carbon::now()->subWeek()->endOfWeek(Carbon::SUNDAY);

        $dayOfWeek = null;

        $weeklyRevenue = [];
        $test = [];

        foreach (range(0, 6) as $day) {
            $currentWeekRevenue[Carbon::now()->startOfWeek(Carbon::MONDAY)->addDays($day)->dayName] = 0;
            $lastWeekRevenue[Carbon::now()->subWeek()->startOfWeek(Carbon::MONDAY)->addDays($day)->dayName] = 0;
        }

        //this is for customization request when order is being approved, and the user paid
        // foreach($this->database->getReference('customizedRequest')->getSnapshot()->getValue() as $requestID => $weeklyCustomizationRequestInfo) {
        //     $requestDate = Carbon::parse($weeklyCustomizationRequestInfo['orderDate']);
        //     $dayOfWeek = $requestDate->dayName;

        //     if ($requestDate->between($startOfCurrentWeek, $endOfCurrentWeek) && $weeklyCustomizationRequestInfo['isPaid'] && $weeklyCustomizationRequestInfo['orderStatus'] != 'Waiting for Approval' && $weeklyCustomizationRequestInfo['orderStatus'] != 'Request Cancelled' && $weeklyCustomizationRequestInfo['orderStatus'] != 'Request Cancelled') {

        //         $currentWeekRevenue[$dayOfWeek] += $weeklyCustomizationRequestInfo['amountToPay'];
        //         $currSalesWithEwallet += $weeklyCustomizationRequestInfo['amountToPay'];

        //     }

        //     if ($requestDate->between($startOfLastWeek, $endOfLastWeek) && $weeklyCustomizationRequestInfo['isPaid'] && $weeklyCustomizationRequestInfo['orderStatus'] != 'Waiting for Approval' && $weeklyCustomizationRequestInfo['orderStatus'] != 'Request Cancelled' && $weeklyCustomizationRequestInfo['orderStatus'] != 'Request Cancelled') {

        //         $lastWeekRevenue[$dayOfWeek] += $weeklyCustomizationRequestInfo['amountToPay'];
        //         $pastSalesWithEwallet += $weeklyCustomizationRequestInfo['amountToPay'];

        //     }

        // }

        foreach ($this->database->getReference('orders')->getSnapshot()->getValue() as $orderID => $weeklyRevenueInfo) {

            $orderDate = Carbon::parse($weeklyRevenueInfo['orderDate']);
            $dayOfWeek = $orderDate->dayName;

            //current week
            // if ($orderDate->between($startOfCurrentWeek, $endOfCurrentWeek) && $weeklyRevenueInfo['paymentMethod'] === 'ewallet' && $weeklyRevenueInfo['orderStatus'] != 'Order Completed' && $weeklyRevenueInfo['orderStatus'] != 'Waiting for Confirmation' && $weeklyRevenueInfo['orderStatus'] != 'Order Cancelled' && $weeklyRevenueInfo['orderStatus'] != 'Request Rejected' && $weeklyRevenueInfo['orderStatus'] != 'Request Cancelled') {

            //     if (!$weeklyRevenueInfo['isBulkyOrder']) {
            //         $currentWeekRevenue[$dayOfWeek] += $weeklyRevenueInfo['amountToPay'];
            //         $currSalesWithEwallet += $weeklyRevenueInfo['amountToPay'];
            //     }

            //     if ($orderID === $weeklyRevenueInfo['associatedOrderID'] && $weeklyRevenueInfo['isBulkyOrder'] === true) {

            //         $currentWeekRevenue[$dayOfWeek] += $weeklyRevenueInfo['amountToPay'];
            //         $currSalesWithEwallet += $weeklyRevenueInfo['amountToPay'];
            //     }

            // }

            if ($orderDate->between($startOfCurrentWeek, $endOfCurrentWeek) && $weeklyRevenueInfo['orderStatus'] === 'Order Completed') {

                if (!$weeklyRevenueInfo['isBulkyOrder']) {
                    $currentWeekRevenue[$dayOfWeek] += $weeklyRevenueInfo['amountToPay'];
                    $currSalesWithEwallet += $weeklyRevenueInfo['amountToPay'];
                }

                if ($orderID === $weeklyRevenueInfo['associatedOrderID'] && $weeklyRevenueInfo['isBulkyOrder'] === true) {
                    $currentWeekRevenue[$dayOfWeek] += $weeklyRevenueInfo['amountToPay'];
                    $currSales += $weeklyRevenueInfo['amountToPay'];
                }
            }

            //last week
            // if ($orderDate->between($startOfLastWeek, $endOfLastWeek) && $weeklyRevenueInfo['paymentMethod'] === 'ewallet' && $weeklyRevenueInfo['orderStatus'] != 'Order Completed' && $weeklyRevenueInfo['orderStatus'] != 'Waiting for Confirmation' && $weeklyRevenueInfo['orderStatus'] != 'Order Cancelled' && $weeklyRevenueInfo['orderStatus'] != 'Request Rejected' && $weeklyRevenueInfo['orderStatus'] != 'Request Cancelled') {

            //     if(!$weeklyRevenueInfo['isBulkyOrder']) { 
            //         $lastWeekRevenue[$dayOfWeek] += $weeklyRevenueInfo['amountToPay'];
            //         $pastSalesWithEwallet += $weeklyRevenueInfo['amountToPay'];
            //     }

            //     if ($orderID === $weeklyRevenueInfo['associatedOrderID'] && $weeklyRevenueInfo['isBulkyOrder'] === true) {

            //         $lastWeekRevenue[$dayOfWeek] += $weeklyRevenueInfo['amountToPay'];
            //         $pastSalesWithEwallet += $weeklyRevenueInfo['amountToPay'];
            //     }
            // }

            if ($orderDate->between($startOfLastWeek, $endOfLastWeek) && $weeklyRevenueInfo['orderStatus'] === 'Order Completed') {

                if(!$weeklyRevenueInfo['isBulkyOrder']) { 
                    $lastWeekRevenue[$dayOfWeek] += $weeklyRevenueInfo['amountToPay'];
                    $pastSales += $weeklyRevenueInfo['amountToPay'];
                }

                if ($orderID === $weeklyRevenueInfo['associatedOrderID'] && $weeklyRevenueInfo['isBulkyOrder'] === true) {
                    $lastWeekRevenue[$dayOfWeek] += $weeklyRevenueInfo['amountToPay'];
                    $pastSales += $weeklyRevenueInfo['amountToPay'];

                }
            }
        }

        $weeklyRevenue = [
            'currentRevenue' => $currentWeekRevenue,
            'currSales' => $currSales + $currSalesWithEwallet,

            'pastRevenue' => $lastWeekRevenue,
            'pastSales' => $pastSales + $pastSalesWithEwallet
        ];

        return response()->json($weeklyRevenue);
    }


    public function montlyRevenue()
    {
        $currentMonthRevenueByWeek = [
            'Week 1' => 0,
            'Week 2' => 0,
            'Week 3' => 0,
            'Week 4' => 0,
        ];

        $lastMonthRevenueByWeek = [
            'Week 1' => 0,
            'Week 2' => 0,
            'Week 3' => 0,
            'Week 4' => 0,
        ];

        $currentMonthSales = 0;
        $lastMonthSales = 0;

        $currentStartOfMonth = Carbon::now()->startOfMonth()->toDateString();
        $currentEndOfMonth = Carbon::now()->endOfMonth()->toDateString();

        $currentMonthFirstWeekStart = Carbon::parse($currentStartOfMonth)->startOfWeek()->toDateString();
        $currentMonthFirstWeekEnd = Carbon::parse($currentMonthFirstWeekStart)->endOfWeek()->toDateString();

        $currentMonthSecondWeekStart = Carbon::parse($currentMonthFirstWeekEnd)->addDay()->toDateString();
        $currentMonthSecondWeekEnd = Carbon::parse($currentMonthSecondWeekStart)->endOfWeek()->toDateString();

        $currentMonthThirdWeekStart = Carbon::parse($currentMonthSecondWeekEnd)->addDay()->toDateString();
        $currentMonthThirdWeekEnd = Carbon::parse($currentMonthThirdWeekStart)->endOfWeek()->toDateString();

        $currentMonthFourthWeekStart = Carbon::parse($currentMonthThirdWeekEnd)->addDay()->toDateString();
        $currentMonthFourthWeekEnd = Carbon::parse($currentMonthFourthWeekStart)->endOfMonth()->toDateString();

        //---------------------

        $lastStartOfMonth = Carbon::now()->subMonth()->startOfMonth()->toDateString();
        $lastEndOfMonth = Carbon::now()->subMonth()->endOfMonth()->toDateString();

        $lastMonthFirstWeekStart = Carbon::parse($lastStartOfMonth)->startOfWeek()->toDateString();
        $lastMonthFirstWeekEnd = Carbon::parse($lastMonthFirstWeekStart)->endOfWeek()->toDateString();

        $lastMonthSecondWeekStart = Carbon::parse($lastMonthFirstWeekEnd)->addDay()->toDateString();
        $lastMonthSecondWeekEnd = Carbon::parse($lastMonthSecondWeekStart)->endOfWeek()->toDateString();

        $lastMonthThirdWeekStart = Carbon::parse($lastMonthSecondWeekEnd)->addDay()->toDateString();
        $lastMonthThirdWeekEnd = Carbon::parse($lastMonthThirdWeekStart)->endOfWeek()->toDateString();

        $lastMonthFourthWeekStart = Carbon::parse($lastMonthThirdWeekEnd)->addDay()->toDateString();
        $lastMonthFourthWeekEnd = Carbon::parse($lastMonthFourthWeekStart)->endOfMonth()->toDateString();

        $test = [];

        foreach ($this->database->getReference('orders')->getSnapshot()->getValue() as $orderID => $monthlyRevenueInfo) {
            $orderDate = Carbon::parse($monthlyRevenueInfo['orderDate'])->toDateString();

            if ($orderDate >= $currentStartOfMonth && $orderDate <= $currentEndOfMonth && $monthlyRevenueInfo['orderStatus'] === 'Order Completed') {
                if (!$monthlyRevenueInfo['isBulkyOrder'] || ($orderID === $monthlyRevenueInfo['associatedOrderID'] && $monthlyRevenueInfo['isBulkyOrder'] === true)) {
                    if ($orderDate >= $currentMonthFirstWeekStart && $orderDate <= $currentMonthFirstWeekEnd) {
                        $currentMonthRevenueByWeek['Week 1'] += $monthlyRevenueInfo['amountToPay'];
                    } elseif ($orderDate >= $currentMonthSecondWeekStart && $orderDate <= $currentMonthSecondWeekEnd) {
                        $currentMonthRevenueByWeek['Week 2'] += $monthlyRevenueInfo['amountToPay'];
                    } elseif ($orderDate >= $currentMonthThirdWeekStart && $orderDate <= $currentMonthThirdWeekEnd) {
                        $currentMonthRevenueByWeek['Week 3'] += $monthlyRevenueInfo['amountToPay'];
                    } elseif ($orderDate >= $currentMonthFourthWeekStart && $orderDate <= $currentMonthFourthWeekEnd) {
                        $currentMonthRevenueByWeek['Week 4'] += $monthlyRevenueInfo['amountToPay'];
                    }
            
                    $currentMonthSales += $monthlyRevenueInfo['amountToPay'];
                }
            }
            
            if ($orderDate >= $lastStartOfMonth && $orderDate <= $lastEndOfMonth && $monthlyRevenueInfo['orderStatus'] === 'Order Completed') {
                if (!$monthlyRevenueInfo['isBulkyOrder'] || ($orderID === $monthlyRevenueInfo['associatedOrderID'] && $monthlyRevenueInfo['isBulkyOrder'] === true)) {
                    if ($orderDate >= $lastMonthFirstWeekStart && $orderDate <= $lastMonthFirstWeekEnd) {
                        $lastMonthRevenueByWeek['Week 1'] += $monthlyRevenueInfo['amountToPay'];
                    } elseif ($orderDate >= $lastMonthSecondWeekStart && $orderDate <= $lastMonthSecondWeekEnd) {
                        $lastMonthRevenueByWeek['Week 2'] += $monthlyRevenueInfo['amountToPay'];
                    } elseif ($orderDate >= $lastMonthThirdWeekStart && $orderDate <= $lastMonthThirdWeekEnd) {
                        $lastMonthRevenueByWeek['Week 3'] += $monthlyRevenueInfo['amountToPay'];
                    } elseif ($orderDate >= $lastMonthFourthWeekStart && $orderDate <= $lastMonthFourthWeekEnd) {
                        $lastMonthRevenueByWeek['Week 4'] += $monthlyRevenueInfo['amountToPay'];
                    }
            
                    $lastMonthSales += $monthlyRevenueInfo['amountToPay'];
                }
            }
        }

        $monthlyRevenue = [
            'currentRevenue' => $currentMonthRevenueByWeek,
            'pastRevenue' => $lastMonthRevenueByWeek,
            'currSales' => $currentMonthSales,
            'pastSales' => $lastMonthSales,
        ];

        return response()->json($monthlyRevenue);
    }

    public function yearlyRevenue()
    {
        $currentYearRevenue = [];
        $lastYearRevenue = [];


        $currentYearSales = 0;
        $currSalesWithEwallet = 0;

        $lastYearSales = 0;
        $pastSalesWithEwallet = 0;

        //we loop to create an array consiting of months from jan - dec where $month represents the month number and using carbon monthName we will
        //be able to get the month name based on the number
        foreach (range(1, 12) as $month) {
            $currentYearRevenue[Carbon::create(null, $month)->monthName] = 0;
            $lastYearRevenue[Carbon::create(null, $month)->monthName] = 0;
        }

        // foreach($this->database->getReference('customizedRequest')->getSnapshot()->getValue() as $requestID => $yearlyRevenueInfo) {
        //     $requestDate = Carbon::parse($yearlyRevenueInfo['orderDate']);
        //     $monthName = $requestDate->monthName;

        //     if ($requestDate->year === Carbon::now()->year && $yearlyRevenueInfo['isPaid'] && $yearlyRevenueInfo['orderStatus'] != 'Waiting for Approval' && $yearlyRevenueInfo['orderStatus'] != 'Request Cancelled' && $yearlyRevenueInfo['orderStatus'] != 'Request Cancelled') {

        //         $currentYearRevenue[$monthName] += $yearlyRevenueInfo['amountToPay'];
        //         $currSalesWithEwallet += $yearlyRevenueInfo['amountToPay'];

        //     }

        //     if ($requestDate->year === Carbon::now()->subYear()->year && $yearlyRevenueInfo['isPaid'] && $yearlyRevenueInfo['orderStatus'] != 'Waiting for Approval' && $yearlyRevenueInfo['orderStatus'] != 'Request Cancelled' && $yearlyRevenueInfo['orderStatus'] != 'Request Cancelled') {

        //         $lastYearRevenue[$monthName] += $yearlyRevenueInfo['amountToPay'];
        //         $pastSalesWithEwallet += $yearlyRevenueInfo['amountToPay'];

        //     }

        // }


        foreach ($this->database->getReference('orders')->getSnapshot()->getValue() as $orderID => $yearlyRevenueInfo) {

            //every loop we parse the order date from the db so we can get the specifc month name from the order date
            $orderDate = Carbon::parse($yearlyRevenueInfo['orderDate']);
            //the this will store the month name from the data being parsed from the db
            $monthName = $orderDate->monthName;

            // //current year
            // if ($orderDate->year == Carbon::now()->year && $yearlyRevenueInfo['paymentMethod'] === 'ewallet' && $yearlyRevenueInfo['orderStatus'] != 'Order Completed' && $yearlyRevenueInfo['orderStatus'] != 'Waiting for Confirmation' && $yearlyRevenueInfo['orderStatus'] != 'Order Cancelled' && $yearlyRevenueInfo['orderStatus'] != 'Request Rejected' && $yearlyRevenueInfo['orderStatus'] != 'Request Cancelled') {

            //     if(!$yearlyRevenueInfo['isBulkyOrder']) {
            //         $currentYearRevenue[$monthName] += $yearlyRevenueInfo['amountToPay'];
            //         $currSalesWithEwallet += $yearlyRevenueInfo['amountToPay'];
            //     }

            //     if ($orderID === $yearlyRevenueInfo['associatedOrderID'] && $yearlyRevenueInfo['isBulkyOrder'] === true) {

            //         $currentYearRevenue[$monthName] += $yearlyRevenueInfo['amountToPay'];
            //         $currSalesWithEwallet += $yearlyRevenueInfo['amountToPay'];
            //     }
            // }

            if ($orderDate->year == Carbon::now()->year && $yearlyRevenueInfo['orderStatus'] === 'Order Completed') {

                //we add it to its corresponding month ex => $currentYearRevenue['September'] += $yearlyRevenueInfo['amountToPay'] where amount to pay is from db
                if (!$yearlyRevenueInfo['isBulkyOrder']) {
                    $currentYearRevenue[$monthName] += $yearlyRevenueInfo['amountToPay'];
                    $currentYearSales += $yearlyRevenueInfo['amountToPay'];
                }

                if ($orderID === $yearlyRevenueInfo['associatedOrderID'] && $yearlyRevenueInfo['isBulkyOrder'] === true) {
                    $currentYearRevenue[$monthName] += $yearlyRevenueInfo['amountToPay'];
                    $currentYearSales += $yearlyRevenueInfo['amountToPay'];
                }
            }

            // //last year
            // if ($orderDate->year == Carbon::now()->subYear()->year && $yearlyRevenueInfo['paymentMethod'] === 'ewallet' && $yearlyRevenueInfo['orderStatus'] != 'Order Completed' && $yearlyRevenueInfo['orderStatus'] != 'Waiting for Confirmation' && $yearlyRevenueInfo['orderStatus'] != 'Order Cancelled' && $yearlyRevenueInfo['orderStatus'] != 'Request Rejected') {

            //     if (!$yearlyRevenueInfo['isBulkyOrder']) {

            //         $lastYearRevenue[$monthName] += $yearlyRevenueInfo['amountToPay'];
            //         $pastSalesWithEwallet += $yearlyRevenueInfo['amountToPay'];
            //     }

            //     if ($orderID === $yearlyRevenueInfo['associatedOrderID'] && $yearlyRevenueInfo['isBulkyOrder'] === true) {

            //         $lastYearRevenue[$monthName] += $yearlyRevenueInfo['amountToPay'];
            //         $pastSalesWithEwallet += $yearlyRevenueInfo['amountToPay'];
            //     }
            // }

            if ($orderDate->year == Carbon::now()->subYear()->year && $yearlyRevenueInfo['orderStatus'] === 'Order Completed') {

                if (!$yearlyRevenueInfo['isBulkyOrder']) {
                    $lastYearRevenue[$monthName] += $yearlyRevenueInfo['amountToPay'];
                    $lastYearSales += $yearlyRevenueInfo['amountToPay'];
                }

                if ($orderID === $yearlyRevenueInfo['associatedOrderID'] && $yearlyRevenueInfo['isBulkyOrder'] === true) {
                    $lastYearRevenue[$monthName] += $yearlyRevenueInfo['amountToPay'];
                    $lastYearSales += $yearlyRevenueInfo['amountToPay'];
                }
            }
        }

        $yearlyRevenue = [
            'currentRevenue' => $currentYearRevenue,
            'pastRevenue' => $lastYearRevenue,

            'currSales' => $currentYearSales + $currSalesWithEwallet,
            'pastSales' => $lastYearSales + $pastSalesWithEwallet
        ];

        return response()->json($yearlyRevenue);
    }

    //sales summary
    public function fetchSalesSummary()
    {
        try {

            //weekly sales summary
            $currentWeekRevenue = 0;
            $lastWeekRevenue = 0;

            $startOfCurrentWeek = Carbon::now()->startOfWeek(Carbon::MONDAY)->toDateString();
            $endOfCurrentWeek = Carbon::now()->endOfWeek(Carbon::SUNDAY)->toDateString();

            $startOfLastWeek = Carbon::now()->subWeek()->startOfWeek(Carbon::MONDAY)->toDateString();
            $endOfLastWeek = Carbon::now()->subWeek()->endOfWeek(Carbon::SUNDAY)->toDateString();
            $weeklyPercentageDifference = 0;
            $monthlyPercentageDifference = 0;
            $yearlyPercentageDifference = 0;

            if ($this->database->getReference('orders')->getSnapshot()->exists()) {

                foreach ($this->database->getReference('orders')->getSnapshot()->getValue() as $orderID => $weeklyRevenueInfo) {
                    $orderDate = Carbon::parse($weeklyRevenueInfo['orderDate']);

                    // if ($orderDate->between($startOfCurrentWeek, $endOfCurrentWeek) && $weeklyRevenueInfo['paymentMethod'] === 'ewallet' && $weeklyRevenueInfo['orderStatus'] != 'Order Completed' && $weeklyRevenueInfo['orderStatus'] != 'Waiting for Confirmation' && $weeklyRevenueInfo['orderStatus'] != 'Order Cancelled' && $weeklyRevenueInfo['orderStatus'] != 'Request Rejected') {

                    //     if (!$weeklyRevenueInfo['isBulkyOrder']) {
                    //         $currentWeekRevenue += $weeklyRevenueInfo['amountToPay'];
                    //     }

                    //     if ($orderID === $weeklyRevenueInfo['associatedOrderID'] && $weeklyRevenueInfo['isBulkyOrder'] === true) {
                    //         $currentWeekRevenue += $weeklyRevenueInfo['amountToPay'];
                    //     }
                    // }

                    if ($orderDate->between($startOfCurrentWeek, $endOfCurrentWeek) && $weeklyRevenueInfo['orderStatus'] === 'Order Completed') {

                        if (!$weeklyRevenueInfo['isBulkyOrder']) {
                            $currentWeekRevenue += $weeklyRevenueInfo['amountToPay'];
                        }

                        if ($orderID === $weeklyRevenueInfo['associatedOrderID'] && $weeklyRevenueInfo['isBulkyOrder'] === true) {
                            $currentWeekRevenue += $weeklyRevenueInfo['amountToPay'];
                        }
                    }

                    if ($weeklyRevenueInfo['orderDate'] >= $startOfLastWeek && $weeklyRevenueInfo['orderDate'] <= $endOfLastWeek && $weeklyRevenueInfo['orderStatus'] === 'Order Completed') {

                        if (!$weeklyRevenueInfo['isBulkyOrder']) {
                            $lastWeekRevenue += $weeklyRevenueInfo['amountToPay'];
                        }

                        if ($orderID === $weeklyRevenueInfo['associatedOrderID'] && $weeklyRevenueInfo['isBulkyOrder'] === true) {
                            $lastWeekRevenue += $weeklyRevenueInfo['amountToPay'];
                        }
                    }
                }

                if ($lastWeekRevenue > 0 && $currentWeekRevenue > 0) {
                    $weeklyPercentageDifference = (($currentWeekRevenue - $lastWeekRevenue) / $lastWeekRevenue) * 100;
                }else if ($lastWeekRevenue == 0 && $currentWeekRevenue > 0) {
                    $weeklyPercentageDifference = 100;
                }

                //montly sales summary
                $currentMonthRevenue = 0;
                $lastMonthRevenue = 0;

                $currentStartOfMonth = Carbon::now()->startOfMonth()->toDateString();
                $endOfCurrentMonth = Carbon::now()->endOfMonth()->toDateString();

                $startOfLastMonth = Carbon::now()->subMonth()->startOfMonth()->toDateString();
                $endOfLastMonth = Carbon::now()->subMonth()->endOfMonth()->toDateString();
                $monthlyPercentageDifference = 0;

                foreach ($this->database->getReference('orders')->getSnapshot()->getValue() as $orderID => $monthlyRevenueInfo) {
                    $orderDate = Carbon::parse($monthlyRevenueInfo['orderDate']);

                    // if ($orderDate->between($currentStartOfMonth, $endOfCurrentMonth) && $monthlyRevenueInfo['paymentMethod'] === 'ewallet' && $monthlyRevenueInfo['orderStatus'] != 'Order Completed' && $monthlyRevenueInfo['orderStatus'] != 'Waiting for Confirmation' && $monthlyRevenueInfo['orderStatus'] != 'Order Cancelled' && $monthlyRevenueInfo['orderStatus'] != 'Request Rejected') {

                    //     if(!$monthlyRevenueInfo['isBulkyOrder']) {
                    //         $currentMonthRevenue += $monthlyRevenueInfo['amountToPay'];
                    //     }

                    //     if ($orderID === $monthlyRevenueInfo['associatedOrderID'] && $monthlyRevenueInfo['isBulkyOrder'] === true) {
                    //         $currentMonthRevenue += $monthlyRevenueInfo['amountToPay'];
                    //     }
                    // }

                    if ($orderDate->between($currentStartOfMonth, $endOfCurrentMonth) && $monthlyRevenueInfo['orderStatus'] === 'Order Completed') {

                        if(!$monthlyRevenueInfo['isBulkyOrder']) {
                            $currentMonthRevenue += $monthlyRevenueInfo['amountToPay'];
                        }

                        if ($orderID === $monthlyRevenueInfo['associatedOrderID'] && $monthlyRevenueInfo['isBulkyOrder'] === true) {
                            $currentMonthRevenue += $monthlyRevenueInfo['amountToPay'];
                        }
                    }

                    if ($orderDate->between($startOfLastMonth, $endOfLastMonth) && $monthlyRevenueInfo['orderStatus'] === 'Order Completed') {
                        if(!$monthlyRevenueInfo['isBulkyOrder']) {
                            $lastMonthRevenue += $monthlyRevenueInfo['amountToPay'];
                        }

                        if ($orderID === $monthlyRevenueInfo['associatedOrderID'] && $monthlyRevenueInfo['isBulkyOrder'] === true) {
                            $lastMonthRevenue += $monthlyRevenueInfo['amountToPay'];
                        }
                    }
                }

                if ($lastMonthRevenue > 0 && $currentMonthRevenue > 0) {
                    $monthlyPercentageDifference = (($currentMonthRevenue - $lastMonthRevenue) / $lastMonthRevenue)  * 100;
                }else if ($lastMonthRevenue == 0 && $currentMonthRevenue > 0) {
                    $monthlyPercentageDifference = 100;
                }

                //yearly sales summary
                $currentYearRevenue = 0;
                $lastYearRevenue = 0;

                $yearlyPercentageDifference = 0;

                foreach ($this->database->getReference('orders')->getSnapshot()->getValue() as $orderID => $yearlyRevenueInfo) {
                    $orderDate = Carbon::parse($yearlyRevenueInfo['orderDate']);

                    // if ($orderDate->year === Carbon::now()->year && $yearlyRevenueInfo['paymentMethod'] === 'ewallet' && $yearlyRevenueInfo['orderStatus'] != 'Order Completed' && $yearlyRevenueInfo['orderStatus'] != 'Waiting for Confirmation' && $yearlyRevenueInfo['orderStatus'] != 'Order Cancelled' && $yearlyRevenueInfo['orderStatus'] != 'Request Rejected') {

                    //     if(!$yearlyRevenueInfo['isBulkyOrder']) {
                    //         $currentYearRevenue += $yearlyRevenueInfo['amountToPay'];
                    //     }

                    //     if ($orderID === $yearlyRevenueInfo['associatedOrderID'] && $yearlyRevenueInfo['isBulkyOrder'] === true) {
                    //         $currentYearRevenue += $yearlyRevenueInfo['amountToPay'];
                    //     }
                    // }

                    if ($orderDate->year === Carbon::now()->year && $yearlyRevenueInfo['orderStatus'] === 'Order Completed') {

                        if(!$yearlyRevenueInfo['isBulkyOrder']) {
                            $currentYearRevenue += $yearlyRevenueInfo['amountToPay'];
                        }

                        if ($orderID === $yearlyRevenueInfo['associatedOrderID'] && $yearlyRevenueInfo['isBulkyOrder'] === true) {
                            $currentYearRevenue += $yearlyRevenueInfo['amountToPay'];
                        }
                    }

                    if ($orderDate->year === Carbon::now()->subYear()->year && $yearlyRevenueInfo['orderStatus'] === 'Order Completed') {

                        if(!$yearlyRevenueInfo['isBulkyOrder']) {
                            $lastYearRevenue += $yearlyRevenueInfo['amountToPay'];
                        }

                        if ($orderID === $yearlyRevenueInfo['associatedOrderID'] && $yearlyRevenueInfo['isBulkyOrder'] === true) {
                            $lastYearRevenue += $yearlyRevenueInfo['amountToPay'];
                        }
                    }
                }

                if ($lastYearRevenue > 0 && $currentYearRevenue > 0) {
                    $yearlyPercentageDifference = (($currentYearRevenue - $lastYearRevenue) / $lastYearRevenue) * 100;
                } else if ($lastYearRevenue == 0 && $currentYearRevenue > 0) {
                    $yearlyPercentageDifference = 100;
                }
            }

            return response()->json([
                'weeklySummary' => round($weeklyPercentageDifference, 2),
                'monthlySummary' => round($monthlyPercentageDifference, 2),
                'yearlySummary' => round($yearlyPercentageDifference, 2)
            ]);
        } catch (\Exception $e) {
            return response($e->getMessage());
        }
    }
}
