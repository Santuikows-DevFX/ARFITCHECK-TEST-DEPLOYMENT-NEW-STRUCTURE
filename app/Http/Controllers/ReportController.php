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

        foreach (range(0, 6) as $day) {
            $currentWeekRevenue[Carbon::now()->startOfWeek(Carbon::MONDAY)->addDays($day)->dayName] = 0;
            $lastWeekRevenue[Carbon::now()->subWeek()->startOfWeek(Carbon::MONDAY)->addDays($day)->dayName] = 0;
        }

        foreach ($this->database->getReference('orders')->getSnapshot()->getValue() as $orderID => $weeklyRevenueInfo) {

            $orderDate = Carbon::parse($weeklyRevenueInfo['orderDate']);
            $dayOfWeek = $orderDate->dayName;

            //current week
            if ($orderDate->between($startOfCurrentWeek, $endOfCurrentWeek) && $weeklyRevenueInfo['paymentMethod'] === 'ewallet' && $weeklyRevenueInfo['orderStatus'] != 'Order Completed' && $weeklyRevenueInfo['orderStatus'] != 'Waiting for Confirmation' && $weeklyRevenueInfo['orderStatus'] != 'Order Cancelled' && $weeklyRevenueInfo['orderStatus'] != 'Request Rejected') {

                if (!$weeklyRevenueInfo['isBulkyOrder']) {
                    $currentWeekRevenue[$dayOfWeek] += $weeklyRevenueInfo['amountToPay'];
                    $currSalesWithEwallet += $weeklyRevenueInfo['amountToPay'];
                }

                if ($orderID === $weeklyRevenueInfo['associatedOrderID'] && $weeklyRevenueInfo['isBulkyOrder'] === true) {

                    $currentWeekRevenue[$dayOfWeek] += $weeklyRevenueInfo['amountToPay'];
                    $currSalesWithEwallet += $weeklyRevenueInfo['amountToPay'];
                }
            }

            if ($orderDate->between($startOfCurrentWeek, $endOfCurrentWeek) && $weeklyRevenueInfo['orderStatus'] === 'Order Completed') {

                $currentWeekRevenue[$dayOfWeek] += $weeklyRevenueInfo['amountToPay'];
                $currSales += $weeklyRevenueInfo['amountToPay'];

                if ($orderID === $weeklyRevenueInfo['associatedOrderID'] && $weeklyRevenueInfo['isBulkyOrder'] === true) {
                    $currentWeekRevenue[$dayOfWeek] -= $weeklyRevenueInfo['amountToPay'];
                    $currSales -= $weeklyRevenueInfo['amountToPay'];
                }
            }

            //last week
            if ($orderDate->between($startOfLastWeek, $endOfLastWeek) && $weeklyRevenueInfo['paymentMethod'] === 'ewallet' && $weeklyRevenueInfo['orderStatus'] != 'Order Completed' && $weeklyRevenueInfo['orderStatus'] != 'Waiting for Confirmation' && $weeklyRevenueInfo['orderStatus'] != 'Order Cancelled' && $weeklyRevenueInfo['orderStatus'] != 'Request Rejected') {

                if(!$weeklyRevenueInfo['isBulkyOrder']) { 
                    $lastWeekRevenue[$dayOfWeek] += $weeklyRevenueInfo['amountToPay'];
                    $pastSalesWithEwallet += $weeklyRevenueInfo['amountToPay'];
                }

                if ($orderID === $weeklyRevenueInfo['associatedOrderID'] && $weeklyRevenueInfo['isBulkyOrder'] === true) {

                    $lastWeekRevenue[$dayOfWeek] += $weeklyRevenueInfo['amountToPay'];
                    $pastSalesWithEwallet += $weeklyRevenueInfo['amountToPay'];
                }
            }

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
        $currentMonthRevenue = 0;
        $lastMonthRevenue = 0;

        // week 1
        $currentStartOfMonth = Carbon::now()->startOfMonth()->toDateString();
        $currentMonthFirstWeekStart = Carbon::parse($currentStartOfMonth)->startOfWeek()->toDateString();
        $currentMonthFirstWeekEnd = Carbon::parse($currentMonthFirstWeekStart)->endOfWeek()->toDateString();

        // week2
        $currentMonthSecondWeekStart = Carbon::parse($currentMonthFirstWeekEnd)->addDay()->toDateString();
        $currentMonthSecondWeekEnd = Carbon::parse($currentMonthSecondWeekStart)->addWeek()->toDateString();

        $endOfCurrentMonth = Carbon::now()->endOfMonth()->toDateString();

        $startOfLastMonth = Carbon::now()->subMonth()->startOfMonth()->toDateString();
        $endOfLastMonth = Carbon::now()->subMonth()->endOfMonth()->toDateString();


        $monthlyRevenue = [];

        foreach ($this->database->getReference('orders')->getSnapshot()->getValue() as $monthlyRevenueInfo) {
            $orderDate = Carbon::parse($monthlyRevenueInfo['orderDate'])->toDateString();

            if ($orderDate >= $currentStartOfMonth && $orderDate <= $endOfCurrentMonth && $monthlyRevenueInfo['orderStatus'] === 'Order Completed') {
                $currentMonthRevenue += $monthlyRevenueInfo['amountToPay'];
            }

            if ($orderDate >= $startOfLastMonth && $orderDate <= $endOfLastMonth && $monthlyRevenueInfo['orderStatus'] === 'Order Completed') {
                $lastMonthRevenue += $monthlyRevenueInfo['amountToPay'];
            }
        }

        $monthlyRevenue[] = [
            'currentRevenue' => $currentMonthRevenue > 0 ? $currentMonthRevenue : 0,
            'pastRevenue' => $lastMonthRevenue > 0 ? $lastMonthRevenue : 0,
        ];

        return response()->json([
            'currMonthFirstWeekStart' => $currentMonthFirstWeekStart,
            'currMonthFirstWeekEnd' => $currentMonthFirstWeekEnd,

            'currMonthSecondWeekStart' => $currentMonthSecondWeekStart,
            'currMonthSecondWeekEnd' => $currentMonthSecondWeekEnd,
        ]);
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

        foreach ($this->database->getReference('orders')->getSnapshot()->getValue() as $orderID => $yearlyRevenueInfo) {

            //every loop we parse the order date from the db so we can get the specifc month name from the order date
            $orderDate = Carbon::parse($yearlyRevenueInfo['orderDate']);
            //the this will store the month name from the data being parsed from the db
            $monthName = $orderDate->monthName;

            //current year
            if ($orderDate->year == Carbon::now()->year && $yearlyRevenueInfo['paymentMethod'] === 'ewallet' && $yearlyRevenueInfo['orderStatus'] != 'Order Completed' && $yearlyRevenueInfo['orderStatus'] != 'Waiting for Confirmation' && $yearlyRevenueInfo['orderStatus'] != 'Order Cancelled' && $yearlyRevenueInfo['orderStatus'] != 'Request Rejected') {

                if(!$yearlyRevenueInfo['isBulkyOrder']) {
                    $currentYearRevenue[$monthName] += $yearlyRevenueInfo['amountToPay'];
                    $currSalesWithEwallet += $yearlyRevenueInfo['amountToPay'];
                }

                if ($orderID === $yearlyRevenueInfo['associatedOrderID'] && $yearlyRevenueInfo['isBulkyOrder'] === true) {

                    $currentYearRevenue[$monthName] += $yearlyRevenueInfo['amountToPay'];
                    $currSalesWithEwallet += $yearlyRevenueInfo['amountToPay'];
                }
            }

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

            //last year
            if ($orderDate->year == Carbon::now()->subYear()->year && $yearlyRevenueInfo['paymentMethod'] === 'ewallet' && $yearlyRevenueInfo['orderStatus'] != 'Order Completed' && $yearlyRevenueInfo['orderStatus'] != 'Waiting for Confirmation' && $yearlyRevenueInfo['orderStatus'] != 'Order Cancelled' && $yearlyRevenueInfo['orderStatus'] != 'Request Rejected') {

                if (!$yearlyRevenueInfo['isBulkyOrder']) {

                    $lastYearRevenue[$monthName] += $yearlyRevenueInfo['amountToPay'];
                    $pastSalesWithEwallet += $yearlyRevenueInfo['amountToPay'];
                }

                if ($orderID === $yearlyRevenueInfo['associatedOrderID'] && $yearlyRevenueInfo['isBulkyOrder'] === true) {

                    $lastYearRevenue[$monthName] += $yearlyRevenueInfo['amountToPay'];
                    $pastSalesWithEwallet += $yearlyRevenueInfo['amountToPay'];
                }
            }

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

                    if ($orderDate->between($startOfCurrentWeek, $endOfCurrentWeek) && $weeklyRevenueInfo['paymentMethod'] === 'ewallet' && $weeklyRevenueInfo['orderStatus'] != 'Order Completed' && $weeklyRevenueInfo['orderStatus'] != 'Waiting for Confirmation' && $weeklyRevenueInfo['orderStatus'] != 'Order Cancelled' && $weeklyRevenueInfo['orderStatus'] != 'Request Rejected') {

                        if (!$weeklyRevenueInfo['isBulkyOrder']) {
                            $currentWeekRevenue += $weeklyRevenueInfo['amountToPay'];
                        }

                        if ($orderID === $weeklyRevenueInfo['associatedOrderID'] && $weeklyRevenueInfo['isBulkyOrder'] === true) {
                            $currentWeekRevenue += $weeklyRevenueInfo['amountToPay'];
                        }
                    }

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

                    if ($orderDate->between($currentStartOfMonth, $endOfCurrentMonth) && $monthlyRevenueInfo['paymentMethod'] === 'ewallet' && $monthlyRevenueInfo['orderStatus'] != 'Order Completed' && $monthlyRevenueInfo['orderStatus'] != 'Waiting for Confirmation' && $monthlyRevenueInfo['orderStatus'] != 'Order Cancelled' && $monthlyRevenueInfo['orderStatus'] != 'Request Rejected') {

                        if(!$monthlyRevenueInfo['isBulkyOrder']) {
                            $currentMonthRevenue += $monthlyRevenueInfo['amountToPay'];
                        }

                        if ($orderID === $monthlyRevenueInfo['associatedOrderID'] && $monthlyRevenueInfo['isBulkyOrder'] === true) {
                            $currentMonthRevenue += $monthlyRevenueInfo['amountToPay'];
                        }
                    }

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
                }

                //yearly sales summary
                $currentYearRevenue = 0;
                $lastYearRevenue = 0;

                $yearlyPercentageDifference = 0;

                foreach ($this->database->getReference('orders')->getSnapshot()->getValue() as $orderID => $yearlyRevenueInfo) {
                    $orderDate = Carbon::parse($yearlyRevenueInfo['orderDate']);

                    if ($orderDate->year === Carbon::now()->year && $yearlyRevenueInfo['paymentMethod'] === 'ewallet' && $yearlyRevenueInfo['orderStatus'] != 'Order Completed' && $yearlyRevenueInfo['orderStatus'] != 'Waiting for Confirmation' && $yearlyRevenueInfo['orderStatus'] != 'Order Cancelled' && $yearlyRevenueInfo['orderStatus'] != 'Request Rejected') {

                        if(!$yearlyRevenueInfo['isBulkyOrder']) {
                            $currentYearRevenue += $yearlyRevenueInfo['amountToPay'];
                        }

                        if ($orderID === $yearlyRevenueInfo['associatedOrderID'] && $yearlyRevenueInfo['isBulkyOrder'] === true) {
                            $currentYearRevenue += $yearlyRevenueInfo['amountToPay'];
                        }
                    }

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
