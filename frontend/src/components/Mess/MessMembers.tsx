import React, { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import EditMessModal from "./EditMessModal";
import ReceivedModal from "./ReceivedModal";
import TransactionsModal from "./TransactionsModal"; // Import the TransactionsModal
import { api } from "@/services/api";

interface Member {
  id: number;
  customer_name: string;
  mobile_number: string;
  start_date: string;
  end_date: string;
  mess_type: string;
  total_price: string;
  payment_method: string;
  paid_amount?: string;
  pending_amount?: string;
  total_amount: string;
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

const MessMembers: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isReceivedModalOpen, setIsReceivedModalOpen] = useState(false);
  const [isTransactionsModalOpen, setIsTransactionsModalOpen] = useState(false); // For TransactionsModal
  const [currentMember, setCurrentMember] = useState<Member | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await api.get("/messes/");
      if (response.data && Array.isArray(response.data.results)) {
        setMembers(response.data.results);
      } else {
        console.error("Unexpected response format:", response.data);
        setError("Unexpected data format from API");
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
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

  const handleEditClick = (member: Member) => {
    setCurrentMember(member);
    setIsEditModalOpen(true);
  };

  const handleReceivedClick = (member: Member) => {
    setCurrentMember(member);
    setIsReceivedModalOpen(true);
  };

  const handleMobileClick = async (member: Member) => {
    await fetchTransactions(member.id);
    setCurrentMember(member);
    setIsTransactionsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsEditModalOpen(false);
    setIsReceivedModalOpen(false);
    setIsTransactionsModalOpen(false); // Close TransactionsModal
    setCurrentMember(null);
  };

  const handleSave = (updatedMember: Member) => {
    setMembers((prevMembers) =>
      prevMembers.map((member) =>
        member.id === updatedMember.id ? updatedMember : member
      )
    );
  };

  const handleTransactionSaved = () => {
    fetchMembers();
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  // Calculate totals
  const totalCashAmount = members.reduce(
    (sum, member) => sum + parseFloat(member.cash_amount || "0"),
    0
  );
  const totalBankAmount = members.reduce(
    (sum, member) => sum + parseFloat(member.bank_amount || "0"),
    0
  );
  const totalPaidAmount = members.reduce(
    (sum, member) => sum + parseFloat(member.paid_amount || "0"),
    0
  );
  const totalPendingAmount = members.reduce(
    (sum, member) => sum + parseFloat(member.pending_amount || "0"),
    0
  );
  const totalGrandTotal = members.reduce(
    (sum, member) => sum + parseFloat(member.grand_total || "0"),
    0
  );

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-200">
          <tr>
            <th className="py-2 px-4 border-b text-left">Name</th>
            <th className="py-2 px-4 border-b text-left">Mobile</th>
            <th className="py-2 px-4 border-b text-left">Start Date</th>
            <th className="py-2 px-4 border-b text-left">End Date</th>
            <th className="py-2 px-4 border-b text-left">Payment type</th>
            <th className="py-2 px-4 border-b text-left">Cash</th>
            <th className="py-2 px-4 border-b text-left">Bank</th>
            <th className="py-2 px-4 border-b text-left">Paid</th>
            <th className="py-2 px-4 border-b text-left">Pending</th>
            <th className="py-2 px-4 border-b text-left">Total</th>
            <th className="py-2 px-4 border-b text-left">Edit</th>
            <th className="py-2 px-4 border-b text-left">Received</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.id} className="hover:bg-gray-100">
              <td className="py-2 px-4 border-b">{member.customer_name}</td>
              <td className="py-2 px-4 border-b">
                <button
                  className="text-blue-500 hover:underline"
                  onClick={() => handleMobileClick(member)}
                >
                  {member.mobile_number}
                </button>
              </td>
              <td className="py-2 px-4 border-b">{member.start_date}</td>
              <td className="py-2 px-4 border-b">{member.end_date}</td>
              <td className="py-2 px-4 border-b">{member.payment_method}</td>
              <td className="py-2 px-4 border-b">QR{member.cash_amount}</td>
              <td className="py-2 px-4 border-b">QR{member.bank_amount}</td>
              <td className="py-2 px-4 border-b">QR{member.paid_amount}</td>
              <td className="py-2 px-4 border-b">QR{member.pending_amount}</td>
              <td className="py-2 px-4 border-b">QR{member.grand_total}</td>
              <td className="py-2 px-4 border-b">
                <button
                  className="bg-black text-white py-1 px-2 rounded hover:bg-gray-500"
                  onClick={() => handleEditClick(member)}
                >
                  <Pencil />
                </button>
              </td>
              <td className="py-2 px-4 border-b">
                <button
                  className={`py-1 px-2 rounded ${
                    member.pending_amount && Number(member.pending_amount) > 0
                      ? "bg-green-500 text-white hover:bg-green-700"
                      : "bg-gray-400 text-white cursor-not-allowed"
                  }`}
                  onClick={() => handleReceivedClick(member)}
                  disabled={!(member.pending_amount && Number(member.pending_amount) > 0)}
                >
                  Received
                </button>
              </td>
            </tr>
          ))}
          {/* Totals Row */}
          <tr className="bg-gray-100 font-bold">
            <td className="py-2 px-4 border-b text-right" colSpan={5}>Totals</td>
            <td className="py-2 px-4 border-b">QR{totalCashAmount.toFixed(2)}</td>
            <td className="py-2 px-4 border-b">QR{totalBankAmount.toFixed(2)}</td>
            <td className="py-2 px-4 border-b">QR{totalPaidAmount.toFixed(2)}</td>
            <td className="py-2 px-4 border-b">QR{totalPendingAmount.toFixed(2)}</td>
            <td className="py-2 px-4 border-b">QR{totalGrandTotal.toFixed(2)}</td>
            <td className="py-2 px-4 border-b" colSpan={2}></td>
          </tr>
        </tbody>
      </table>
      {isEditModalOpen && currentMember && (
        <EditMessModal
          isOpen={isEditModalOpen}
          onClose={handleModalClose}
          member={currentMember}
          onSave={handleSave}
        />
      )}
      {isReceivedModalOpen && currentMember && (
        <ReceivedModal
          isOpen={isReceivedModalOpen}
          onClose={handleModalClose}
          memberId={currentMember.id}
          onSave={handleTransactionSaved}
        />
      )}
      {isTransactionsModalOpen && currentMember && (
        <TransactionsModal
          isOpen={isTransactionsModalOpen}
          onClose={handleModalClose}
          transactions={transactions}
        />
      )}
      {isTransactionsModalOpen && transactions.length === 0 && (
        <div className="text-center py-4">No transactions available for this member.</div>
      )}
    </div>
  );
};

export default MessMembers;
