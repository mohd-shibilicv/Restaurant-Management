import React, { useState, useEffect } from "react";
import Layout from "../components/Layout/Layout";
import PaginationControls from "../components/Layout/PaginationControls";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"; // Import the styles
import { RotateCcw } from 'lucide-react';
import SalesPrint from "@/components/SalesReport/SalesPrint";
import { api } from "@/services/api";
import TransactionsModal from "@/components/Mess/TransactionsModal";
import SalesHistoryModal from "@/components/SalesReport/SalesHistoryModal";
import SalesEditModal from "@/components/SalesReport/SalesEditModal";
import MessEditModal from "@/components/SalesReport/MessEditModal";
import { format } from "date-fns";
import { Eye, Pencil } from 'lucide-react';

interface SalesReport {
  id: number;
  total_amount: number;
  status: string;
  order_type: string;
  payment_method: string;
  created_at: string;
  invoice_number: string;
  cash_amount: string;
  bank_amount: string;
  customer_phone_number: string;

}
interface MessType {
  id: number;
  name: string;
}


interface MessReport {
  id: number;
  customer_name: string;
  mobile_number: string;
  mess_type: MessType;
  total_amount: number;
  paid_amount: number;
  pending_amount: number;
  start_date: string;
  end_date: string;
  payment_method: string;
  grand_total: string;
  cash_amount: string;
  bank_amount: string;
}

interface Transaction {
  id: number;
  received_amount: number;
  cash_amount: number;
  bank_amount: number;
  payment_method: string;
  status: string;
  date: string;
}

const SalesReportPage: React.FC = () => {
  const [reportType, setReportType] = useState<"sales" | "mess">("sales");
  const [reports, setReports] = useState<SalesReport[]>([]);
  const [messReports, setMessReports] = useState<MessReport[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeButton, setActiveButton] = useState<string | null>(null);
  const [isTransactionsModalOpen, setIsTransactionsModalOpen] = useState(false); // For TransactionsModal
  const [isSalesHistoryModalOpen, setIsSalesHistoryModalOpen] = useState(false);

  const [isSalesEditModalOpen, setIsSalesEditModalOpen] = useState(false);
  const [isMessEditModalOpen, setIsMessEditModalOpen] = useState(false);
  const [currentReport, setCurrentReport] = useState(null);
  const [isAllButtonActive, setIsAllButtonActive] = useState(true);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [orderHistiory, setOrderHistory] = useState<Transaction[]>([]);
  const [currentMember, setCurrentMember] = useState<MessReport | null>(null);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchDataWithFilter({});
  }, [reportType, fromDate, toDate]);

  const fetchDataWithFilter = async (filter: Record<string, string>) => {
    try {
      const baseUrl = reportType === "sales"
        ? "http://127.0.0.1:8000/api/orders/sales_report/"
        : "http://127.0.0.1:8000/api/messes/mess_report/";

      const url = new URL(baseUrl);
      const token = localStorage.getItem("token");

      const convertToUTCDate = (date: Date) => {
        const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        return utcDate.toISOString().split("T")[0];
      };

      if (fromDate) {
        url.searchParams.append("from_date", convertToUTCDate(fromDate));
      }
      if (toDate) {
        url.searchParams.append("to_date", convertToUTCDate(toDate));
      }

      Object.entries(filter).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (reportType === "sales") {
          setReports(data);
        } else {
          setMessReports(data);
        }
        setCurrentPage(1);
      } else {
        console.error("HTTP error! status:", response.status);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  const fetchTransactions = async (memberId: number) => {
    try {
      const response = await api.get(`/transactions/?mess_id=${memberId}`);
      if (response.data && Array.isArray(response.data.results)) {
        setTransactions(response.data.results);
      } else {
        console.error("Unexpected response format:", response.data);
        setError("Unexpected data format from API");
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError("Failed to fetch transactions");
    }
  };


  const fetchOrderHistory = async (mobileNumber: string) => {
    try {
      const response = await api.get(`/orders/user_order_history/?customer_phone_number=${mobileNumber}`);
      if (response.data && Array.isArray(response.data)) {
        setOrderHistory(response.data);
      } else {
        console.error("Unexpected response format:", response.data);
        setError("Unexpected data format from API");
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError("Failed to fetch transactions");
    }
  };

  const handleSalesMobileClick = async (report: SalesReport) => {
    await fetchOrderHistory(report.customer_phone_number);
    setCurrentMember(report);
    setIsSalesHistoryModalOpen(true); // Ensure this modal logic is connected
  };

  const handleMobileClick = async (report: MessReport) => {
    await fetchTransactions(report.id);
    setCurrentMember(report);
    setIsTransactionsModalOpen(true);
  };


  const handleSalesEditClick = (report) => {
    setCurrentReport(report);
    setIsSalesEditModalOpen(true);
  };

  // Function to handle opening the mess edit modal
  const handleMessEditClick = (report) => {
    setCurrentReport(report);
    setIsMessEditModalOpen(true);
  };

  const handleModalClose = () => {
    setIsTransactionsModalOpen(false);
    setIsSalesHistoryModalOpen(false);
    setIsSalesEditModalOpen(false);
    setIsMessEditModalOpen(false);
    setCurrentReport(null);
    setCurrentMember(null);
  };



  const handleButtonClick = (buttonName: string) => {
    let filter = {  };
    setActiveButton(buttonName);
    if (buttonName === "All") {
      setFromDate(null);
      setToDate(null);
      setCurrentPage(1);
      fetchDataWithFilter({});
    }

    if (buttonName === "All") {
      filter = {}; // No filter for "All" button
    } else if (reportType === "sales") {
      switch (buttonName) {
        case "Dining":
          filter = { order_type: "dining" };
          break;
        case "Takeaway":
          filter = { order_type: "takeaway" };
          break;
        case "Delivery":
          filter = { order_type: "delivery" };
          break;
        case "Cash":
          filter = { payment_method: "cash" };
          break;
        case "Bank":
          filter = { payment_method: "bank" };
          break;
        case "Cash-Bank":
          filter = { payment_method: "cash-bank" };
          break;
        case "Canceled":
          filter = { order_status: "cancelled" };
          break;
        case "Delivered":
          filter = { order_status: "delivered" };
          break;
        default:
          filter = {}; // No filter if the button name does not match
      }
    } else if (reportType === "mess") {
      switch (buttonName) {
        case "Cash":
          filter = { payment_method: "cash" };
          break;
        case "Bank":
          filter = { payment_method: "bank" };
          break;
        case "Cash-Bank":
          filter = { payment_method: "cash-bank" };
          break;
        case "Credit":
          filter = { credit: "credit" };
          break;
        case "Breakfast and Lunch":
          filter = { mess_type: "breakfast_lunch" };
          break;
        case "Breakfast and Dinner":
          filter = { mess_type: "lunch_dinner" };
          break;
        case "Lunch and Dinner":
          filter = { mess_type: "breakfast_dinner" };
          break;
        case "Breakfast and Lunch and Dinner":
          filter = { mess_type: "breakfast_lunch_dinner" };
          break;
        default:
          filter = {}; // No filter if the button name does not match
      }
    }

    fetchDataWithFilter(filter);
  };


  const handleReset = () => {
    setFromDate(null);
    setToDate(null);
    setIsAllButtonActive(true);
    setActiveButton("All")
    setCurrentPage(1);
    fetchDataWithFilter({});
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReports = reports.slice(startIndex, startIndex + itemsPerPage);
  const paginatedMessReports = messReports.slice(startIndex, startIndex + itemsPerPage);

  // Calculate total amount
  const totalAmount = reportType === "sales"
    ? reports.reduce((acc, report) => acc + parseFloat(report.total_amount.toString()), 0)
    : messReports.reduce((acc, report) => acc + parseFloat(report.grand_total.toString()), 0);

  // Calculate total cash
  const totalCashAmount = reportType === "sales"
    ? reports.reduce((acc, report) => acc + parseFloat(report.cash_amount.toString()), 0)
    : messReports.reduce((acc, report) => acc + parseFloat(report.cash_amount.toString()), 0);

  // Calculate total cash
  const totalCardAmount = reportType === "sales"
    ? reports.reduce((acc, report) => acc + parseFloat(report.bank_amount.toString()), 0)
    : messReports.reduce((acc, report) => acc + parseFloat(report.bank_amount.toString()), 0);

  return (
    <Layout>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-4">
            <button
              onClick={() => setReportType("sales")}
              className={`p-4 rounded-lg shadow-md cursor-pointer ${reportType === "sales" ? "bg-purple-500 text-white" : "bg-gray-200"}`}
            >
              Sales Report
            </button>
            <button
              onClick={() => setReportType("mess")}
              className={`p-4 rounded-lg shadow-md cursor-pointer ${reportType === "mess" ? "bg-purple-500 text-white" : "bg-gray-200"}`}
            >
              Mess Report
            </button>
          </div>

          {/* Date Pickers and Reset Button */}
          <div className="flex space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">From Date</label>
              <DatePicker
                selected={fromDate}
                onChange={(date) => setFromDate(date)}
                dateFormat="yyyy-MM-dd"
                className="mt-1 p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">To Date</label>
              <DatePicker
                selected={toDate}
                onChange={(date) => setToDate(date)}
                dateFormat="yyyy-MM-dd"
                className="mt-1 p-2 border rounded"
              />
            </div>
            <button
              onClick={handleReset}
              className="mt-7 p-2 rounded-full bg-red-500 text-white shadow-md"
              title="Reset"
            >
              <RotateCcw size={20} />
            </button>
          </div>
          <SalesPrint
            reportType={reportType}
            reports={reports}
            messReports={messReports}
            totalAmount={totalAmount}
            totalCashAmount={totalCashAmount}
            totalCardAmount={totalCardAmount}
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap space-x-2 mb-4">
          <button
            onClick={() => handleButtonClick("All")}
            className={`p-2 rounded ${activeButton === "All" ? "bg-blue-500 text-white" : "bg-gray-200"} ${isAllButtonActive ? 'bg-blue-500' : 'border border-transparent'}`}
            >
            All
          </button>
          {reportType === "sales" ? (
            <>
              <button
                onClick={() => handleButtonClick("Dining")}
                className={`p-2 rounded ${activeButton === "Dining" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
              >
                Dining
              </button>
              <button
                onClick={() => handleButtonClick("Takeaway")}
                className={`p-2 rounded ${activeButton === "Takeaway" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
              >
                Takeaway
              </button>
              <button
                onClick={() => handleButtonClick("Delivery")}
                className={`p-2 rounded ${activeButton === "Delivery" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
              >
                Delivery
              </button>
              <button
                onClick={() => handleButtonClick("Cash")}
                className={`p-2 rounded ${activeButton === "Cash" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
              >
                Cash
              </button>
              <button
                onClick={() => handleButtonClick("Bank")}
                className={`p-2 rounded ${activeButton === "Bank" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
              >
                Bank
              </button>
              <button
                onClick={() => handleButtonClick("Cash-Bank")}
                className={`p-2 rounded ${activeButton === "Cash-Bank" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
              >
                Cash-Bank
              </button>
              <button
                onClick={() => handleButtonClick("Canceled")}
                className={`p-2 rounded ${activeButton === "Canceled" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
              >
                Canceled
              </button>
              <button
                onClick={() => handleButtonClick("Delivered")}
                className={`p-2 rounded ${activeButton === "Delivered" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
              >
                Delivered
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleButtonClick("Cash")}
                className={`p-2 rounded ${activeButton === "Cash" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
              >
                Cash
              </button>
              <button
                onClick={() => handleButtonClick("Bank")}
                className={`p-2 rounded ${activeButton === "Bank" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
              >
                Bank
              </button>
              <button
                onClick={() => handleButtonClick("Cash-Bank")}
                className={`p-2 rounded ${activeButton === "Cash-Bank" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
              >
                Cash-Bank
              </button>
              <button
                onClick={() => handleButtonClick("Credit")}
                className={`p-2 rounded ${activeButton === "Credit" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
              >
                Credit
              </button>
              <button
                onClick={() => handleButtonClick("Breakfast and Lunch")}
                className={`p-2 rounded ${activeButton === "Breakfast and Lunch" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
              >
                Breakfast and Lunch
              </button>
              <button
                onClick={() => handleButtonClick("Breakfast and Dinner")}
                className={`p-2 rounded ${activeButton === "Breakfast and Dinner" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
              >
                Breakfast and Dinner
              </button>
              <button
                onClick={() => handleButtonClick("Lunch and Dinner")}
                className={`p-2 rounded ${activeButton === "Lunch and Dinner" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
              >
                Lunch and Dinner
              </button>
              <button
                onClick={() => handleButtonClick("Breakfast and Lunch and Dinner")}
                className={`p-2 rounded ${activeButton === "Breakfast and Lunch and Dinner" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
              >
                Breakfast and Lunch and Dinner
              </button>
            </>
          )}
        </div>

        {/* Sales and Mess Report Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg">
            <thead>
              <tr>
                {reportType === "sales" ? (
                  <>
                    <th className="py-2 px-4 bg-gray-200">Invoice </th>
                    <th className="py-2 px-4 bg-gray-200">Mobile</th>
                    <th className="py-2 px-4 bg-gray-200">Date</th>
                    <th className="py-2 px-4 bg-gray-200">Order Type</th>
                    <th className="py-2 px-4 bg-gray-200">Payment Method</th>
                    <th className="py-2 px-4 bg-gray-200">Total Amount</th>
                    <th className="py-2 px-4 bg-gray-200">Cash Amount</th>
                    <th className="py-2 px-4 bg-gray-200">Bank Amount</th>
                    <th className="py-2 px-4 bg-gray-200">History</th>
                    <th className="py-2 px-4 bg-gray-200">Actions</th>
                  </>
                ) : (
                  <>
                    <th className="py-2 px-4 bg-gray-200">Name</th>
                    <th className="py-2 px-4 bg-gray-200">Mobile </th>
                    <th className="py-2 px-4 bg-gray-200">Mess Type</th>
                    <th className="py-2 px-4 bg-gray-200">Total </th>
                    <th className="py-2 px-4 bg-gray-200">Paid </th>
                    <th className="py-2 px-4 bg-gray-200">Pending </th>
                    <th className="py-2 px-4 bg-gray-200">Start Date</th>
                    <th className="py-2 px-4 bg-gray-200">End Date</th>
                    <th className="py-2 px-4 bg-gray-200">Payment Method</th>
                    <th className="py-2 px-4 bg-gray-200">Transactions</th>
                    <th className="py-2 px-4 bg-gray-200">Actions</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {reportType === "sales"
                ? paginatedReports.map((report) => (
                  <tr key={report.id}>
                    <td className="border px-4 py-2">{report.invoice_number}</td>
                    <td className="border px-4 py-2">  {report.customer_phone_number ? report.customer_phone_number : "N/A"} </td>
                    <td className="border px-4 py-2">
                      {format(new Date(report.created_at), 'dd-MM-yyyy')}
                    </td>
                    <td className="border px-4 py-2">{report.order_type}</td>
                    <td className="border px-4 py-2">{report.payment_method}</td>
                    <td className="border px-4 py-2">{report.total_amount}</td>
                    <td className="border px-4 py-2">{report.cash_amount}</td>
                    <td className="border px-4 py-2">{report.bank_amount}</td>
                    <td className="border px-4 py-2">
                      <button
                        onClick={() => handleSalesMobileClick(report)}
                        className="text-blue-500 hover:underline"
                      >
                        <Eye />
                      </button>
                    </td>
                    <td className="border px-4 py-2">
                      <button onClick={() => handleSalesEditClick(report)}><Pencil /></button>
                    </td>
                  </tr>
                ))
                : paginatedMessReports.map((report) => (
                  <tr key={report.id}>
                    <td className="border px-4 py-2">{report.customer_name}</td>
                    <td className="border px-4 py-2">{report.mobile_number}</td>
                    <td className="border px-4 py-2">{report.mess_type.name}</td>
                    <td className="border px-4 py-2">{report.grand_total}</td>
                    <td className="border px-4 py-2">{report.paid_amount}</td>
                    <td className="border px-4 py-2">{report.pending_amount}</td>
                    <td className="border px-4 py-2">
                      {format(new Date(report.start_date), 'dd-MM-yyyy')}
                    </td>
                    <td className="border px-4 py-2">
                      {format(new Date(report.end_date), 'dd-MM-yyyy')}
                    </td>
                    <td className="border px-4 py-2">{report.payment_method}</td>
                    <td className="border px-4 py-2">
                      <button
                        onClick={() => handleMobileClick(report)}
                        className="text-blue-500 hover:underline"
                      >
                        <Eye />

                      </button>
                    </td>
                    <td className="border px-4 py-2">
                      <button onClick={() => handleMessEditClick(report)}><Pencil /></button>

                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Total Amount Display */}
        <div className="mt-4 p-4 bg-gray-100 rounded-lg shadow-md">
          <div className="flex justify-end space-x-4">
            <p className="font-bold text-lg">
              Cash Amount:
            </p>
            <p className="font-bold text-lg">
              ₹{totalCashAmount.toFixed(2)}
            </p>
          </div>
          <div className="flex justify-end space-x-4 mt-2">
            <p className="font-bold text-lg">
              Card Amount:
            </p>
            <p className="font-bold text-lg">
              ₹{totalCardAmount.toFixed(2)}
            </p>
          </div>
          <div className="flex justify-end space-x-4 mt-2">
            <p className="font-bold text-lg">
              Total Amount:
            </p>
            <p className="font-bold text-lg">
              ₹{totalAmount.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Pagination Controls */}
        <PaginationControls
          currentPage={currentPage}
          totalPages={Math.ceil((reportType === "sales" ? reports.length : messReports.length) / itemsPerPage)}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Transactions Modal */}
      {isTransactionsModalOpen && currentMember && (
        <TransactionsModal
          transactions={transactions}
          isOpen={isTransactionsModalOpen}
          onClose={handleModalClose}
          member={currentMember}
        />
      )}

      {/* Transactions Modal */}
      {isSalesHistoryModalOpen && currentMember && (
        <SalesHistoryModal
          orderhistory={orderHistiory}
          isOpen={isSalesHistoryModalOpen}
          onClose={handleModalClose}
          member={currentMember}
        />
      )}

      {isSalesEditModalOpen && (
        <SalesEditModal
          isOpen={isSalesEditModalOpen}
          onClose={handleModalClose}
          report={currentReport} // Pass the report data
        />
      )}

      {isMessEditModalOpen && (
        <MessEditModal
          isOpen={isMessEditModalOpen}
          onClose={handleModalClose}
          report={currentReport} // Pass the report data
        />
      )}


    </Layout>
  );
};

export default SalesReportPage;