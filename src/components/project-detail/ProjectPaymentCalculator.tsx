"use client";
import React, { useState, useEffect } from "react";
import { formatPrice } from "@/utils/format";

export function ProjectPaymentCalculator() {
  const [propertyPrice, setPropertyPrice] = useState(3000000000); // 3 tỷ
  const [downPayment, setDownPayment] = useState(30); // 30%
  const [loanTerm, setLoanTerm] = useState(20); // 20 năm
  const [interestRate, setInterestRate] = useState(8.5); // 8.5%/năm
  const [monthlyIncome, setMonthlyIncome] = useState(50000000); // 50 triệu/tháng

  const [calculation, setCalculation] = useState({
    loanAmount: 0,
    monthlyPayment: 0,
    totalPayment: 0,
    totalInterest: 0,
    incomeRatio: 0,
  });

  useEffect(() => {
    calculateLoan();
  }, [propertyPrice, downPayment, loanTerm, interestRate, monthlyIncome]);

  const calculateLoan = () => {
    const loanAmount = propertyPrice * (1 - downPayment / 100);
    const monthlyRate = interestRate / 100 / 12;
    const numPayments = loanTerm * 12;

    let monthlyPayment = 0;
    if (monthlyRate > 0) {
      monthlyPayment =
        (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) /
        (Math.pow(1 + monthlyRate, numPayments) - 1);
    } else {
      monthlyPayment = loanAmount / numPayments;
    }

    const totalPayment = monthlyPayment * numPayments;
    const totalInterest = totalPayment - loanAmount;
    const incomeRatio = (monthlyPayment / monthlyIncome) * 100;

    setCalculation({
      loanAmount,
      monthlyPayment,
      totalPayment,
      totalInterest,
      incomeRatio,
    });
  };

  const getRiskLevel = (ratio: number) => {
    if (ratio <= 30)
      return { text: "An toàn", color: "text-green-600", bg: "bg-green-100" };
    if (ratio <= 50)
      return {
        text: "Có thể chấp nhận",
        color: "text-yellow-600",
        bg: "bg-yellow-100",
      };
    return { text: "Rủi ro cao", color: "text-red-600", bg: "bg-red-100" };
  };

  const riskLevel = getRiskLevel(calculation.incomeRatio);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Ước tính khoản vay</h2>
        <div className="text-sm text-gray-500">
          <i className="fas fa-calculator mr-1"></i>
          Công cụ tính toán
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giá bất động sản
            </label>
            <div className="relative">
              <input
                type="number"
                value={propertyPrice}
                onChange={(e) => setPropertyPrice(Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                step="100000000"
              />
              <span className="absolute right-3 top-3 text-gray-500">VNĐ</span>
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {formatPrice(propertyPrice)}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vốn tự có ({downPayment}%)
            </label>
            <input
              type="range"
              min="10"
              max="80"
              value={downPayment}
              onChange={(e) => setDownPayment(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-sm text-gray-500 mt-1">
              <span>10%</span>
              <span className="font-medium text-blue-600">
                {formatPrice((propertyPrice * downPayment) / 100)}
              </span>
              <span>80%</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thời hạn vay
            </label>
            <select
              value={loanTerm}
              onChange={(e) => setLoanTerm(Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={10}>10 năm</option>
              <option value={15}>15 năm</option>
              <option value={20}>20 năm</option>
              <option value={25}>25 năm</option>
              <option value={30}>30 năm</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lãi suất (%/năm)
            </label>
            <input
              type="number"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              step="0.1"
              min="1"
              max="20"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thu nhập hàng tháng
            </label>
            <div className="relative">
              <input
                type="number"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                step="5000000"
              />
              <span className="absolute right-3 top-3 text-gray-500">VNĐ</span>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Số tiền cần vay</div>
            <div className="text-2xl font-bold text-blue-600">
              {formatPrice(calculation.loanAmount)}
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Trả hàng tháng</div>
            <div className="text-2xl font-bold text-green-600">
              {formatPrice(calculation.monthlyPayment)}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Tổng tiền lãi</div>
              <div className="font-bold text-gray-900">
                {formatPrice(calculation.totalInterest)}
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Tổng thanh toán</div>
              <div className="font-bold text-gray-900">
                {formatPrice(calculation.totalPayment)}
              </div>
            </div>
          </div>

          {/* Risk Assessment */}
          <div className={`p-4 rounded-lg ${riskLevel.bg}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                Đánh giá khả năng chi trả
              </span>
              <span className={`text-sm font-bold ${riskLevel.color}`}>
                {riskLevel.text}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-white bg-opacity-50 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    calculation.incomeRatio <= 30
                      ? "bg-green-500"
                      : calculation.incomeRatio <= 50
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                  style={{
                    width: `${Math.min(calculation.incomeRatio, 100)}%`,
                  }}
                />
              </div>
              <span className={`text-sm font-bold ${riskLevel.color}`}>
                {calculation.incomeRatio.toFixed(1)}%
              </span>
            </div>
            <div className="text-xs text-gray-600 mt-2">
              Tỷ lệ thu nhập dành để trả nợ (khuyến nghị: dưới 30%)
            </div>
          </div>

          {/* Tips */}
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-start space-x-2">
              <i className="fas fa-lightbulb text-yellow-600 mt-1"></i>
              <div>
                <div className="font-medium text-yellow-800 mb-1">Lưu ý:</div>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>
                    • Đây chỉ là ước tính, lãi suất thực tế có thể thay đổi theo
                    từng ngân hàng
                  </li>
                  <li>• Nên dự trù thêm 20-30% chi phí phát sinh khác</li>
                  <li>• Tỷ lệ trả nợ/thu nhập không nên vượt quá 30-40%</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bank Comparison */}
      <div className="mt-8 pt-6 border-t">
        <h3 className="text-lg font-semibold mb-4">
          So sánh lãi suất các ngân hàng
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-3">Ngân hàng</th>
                <th className="text-center p-3">Lãi suất (%/năm)</th>
                <th className="text-center p-3">Thời hạn tối đa</th>
                <th className="text-center p-3">Trả hàng tháng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[
                { name: "Vietcombank", rate: 8.2, maxTerm: 25 },
                { name: "BIDV", rate: 8.5, maxTerm: 25 },
                { name: "VietinBank", rate: 8.3, maxTerm: 25 },
                { name: "Techcombank", rate: 8.8, maxTerm: 20 },
                { name: "ACB", rate: 8.6, maxTerm: 20 },
              ].map((bank, index) => {
                const monthlyRate = bank.rate / 100 / 12;
                const numPayments = Math.min(loanTerm, bank.maxTerm) * 12;
                const monthlyPayment =
                  (calculation.loanAmount *
                    (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) /
                  (Math.pow(1 + monthlyRate, numPayments) - 1);

                return (
                  <tr key={index}>
                    <td className="p-3 font-medium">{bank.name}</td>
                    <td className="p-3 text-center">{bank.rate}%</td>
                    <td className="p-3 text-center">{bank.maxTerm} năm</td>
                    <td className="p-3 text-center font-medium">
                      {formatPrice(monthlyPayment)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
