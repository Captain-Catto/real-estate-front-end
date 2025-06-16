"use client";
import { useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import locationVN from "../../../../locationVN.json";

type Province = {
  name: string;
  code: number;
  phone_code?: number;
  districts: District[];
};
type District = {
  name: string;
  code: number;
  wards: Ward[];
};
type Ward = {
  short_codename: string;
};

export default function AdminLocationPage() {
  // Deep clone để tránh thay đổi trực tiếp file gốc
  const [provinces, setProvinces] = useState<Province[]>(
    JSON.parse(JSON.stringify(locationVN))
  );
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(
    null
  );
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(
    null
  );

  // Thêm tỉnh
  const handleAddProvince = () => {
    const name = prompt("Tên tỉnh/thành phố:");
    if (!name) return;
    setProvinces([
      ...provinces,
      {
        name,
        code: Date.now(),
        districts: [],
      },
    ]);
  };

  // Sửa tỉnh
  const handleEditProvince = (idx: number) => {
    const name = prompt("Tên mới:", provinces[idx].name);
    if (!name) return;
    const newArr = [...provinces];
    newArr[idx].name = name;
    setProvinces(newArr);
  };

  // Xóa tỉnh
  const handleDeleteProvince = (idx: number) => {
    if (confirm("Xóa tỉnh/thành phố này?")) {
      const newArr = [...provinces];
      newArr.splice(idx, 1);
      setProvinces(newArr);
      setSelectedProvince(null);
      setSelectedDistrict(null);
    }
  };

  // Thêm quận/huyện
  const handleAddDistrict = () => {
    if (!selectedProvince) return;
    const name = prompt("Tên quận/huyện:");
    if (!name) return;
    const newProvinces = provinces.map((p) =>
      p.code === selectedProvince.code
        ? {
            ...p,
            districts: [...p.districts, { name, code: Date.now(), wards: [] }],
          }
        : p
    );
    setProvinces(newProvinces);
    setSelectedProvince(
      newProvinces.find((p) => p.code === selectedProvince.code) || null
    );
  };

  // Sửa quận/huyện
  const handleEditDistrict = (dIdx: number) => {
    if (!selectedProvince) return;
    const name = prompt("Tên mới:", selectedProvince.districts[dIdx].name);
    if (!name) return;
    const newProvinces = provinces.map((p) =>
      p.code === selectedProvince.code
        ? {
            ...p,
            districts: p.districts.map((d, i) =>
              i === dIdx ? { ...d, name } : d
            ),
          }
        : p
    );
    setProvinces(newProvinces);
    setSelectedProvince(
      newProvinces.find((p) => p.code === selectedProvince.code) || null
    );
  };

  // Xóa quận/huyện
  const handleDeleteDistrict = (dIdx: number) => {
    if (!selectedProvince) return;
    if (confirm("Xóa quận/huyện này?")) {
      const newProvinces = provinces.map((p) =>
        p.code === selectedProvince.code
          ? {
              ...p,
              districts: p.districts.filter((_, i) => i !== dIdx),
            }
          : p
      );
      setProvinces(newProvinces);
      setSelectedProvince(
        newProvinces.find((p) => p.code === selectedProvince.code) || null
      );
      setSelectedDistrict(null);
    }
  };

  // Thêm phường/xã
  const handleAddWard = () => {
    if (!selectedProvince || !selectedDistrict) return;
    const name = prompt("Short codename phường/xã:");
    if (!name) return;
    const newProvinces = provinces.map((p) =>
      p.code === selectedProvince.code
        ? {
            ...p,
            districts: p.districts.map((d) =>
              d.code === selectedDistrict.code
                ? {
                    ...d,
                    wards: [...d.wards, { short_codename: name }],
                  }
                : d
            ),
          }
        : p
    );
    setProvinces(newProvinces);
    setSelectedProvince(
      newProvinces.find((p) => p.code === selectedProvince.code) || null
    );
    setSelectedDistrict(
      newProvinces
        .find((p) => p.code === selectedProvince.code)
        ?.districts.find((d) => d.code === selectedDistrict.code) || null
    );
  };

  // Sửa phường/xã
  const handleEditWard = (wIdx: number) => {
    if (!selectedProvince || !selectedDistrict) return;
    const name = prompt(
      "Short codename mới:",
      selectedDistrict.wards[wIdx].short_codename
    );
    if (!name) return;
    const newProvinces = provinces.map((p) =>
      p.code === selectedProvince.code
        ? {
            ...p,
            districts: p.districts.map((d) =>
              d.code === selectedDistrict.code
                ? {
                    ...d,
                    wards: d.wards.map((w, i) =>
                      i === wIdx ? { ...w, short_codename: name } : w
                    ),
                  }
                : d
            ),
          }
        : p
    );
    setProvinces(newProvinces);
    setSelectedProvince(
      newProvinces.find((p) => p.code === selectedProvince.code) || null
    );
    setSelectedDistrict(
      newProvinces
        .find((p) => p.code === selectedProvince.code)
        ?.districts.find((d) => d.code === selectedDistrict.code) || null
    );
  };

  // Xóa phường/xã
  const handleDeleteWard = (wIdx: number) => {
    if (!selectedProvince || !selectedDistrict) return;
    if (confirm("Xóa phường/xã này?")) {
      const newProvinces = provinces.map((p) =>
        p.code === selectedProvince.code
          ? {
              ...p,
              districts: p.districts.map((d) =>
                d.code === selectedDistrict.code
                  ? {
                      ...d,
                      wards: d.wards.filter((_, i) => i !== wIdx),
                    }
                  : d
              ),
            }
          : p
      );
      setProvinces(newProvinces);
      setSelectedProvince(
        newProvinces.find((p) => p.code === selectedProvince.code) || null
      );
      setSelectedDistrict(
        newProvinces
          .find((p) => p.code === selectedProvince.code)
          ?.districts.find((d) => d.code === selectedDistrict.code) || null
      );
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1">
        <AdminHeader />
        <main className="p-6">
          <h1 className="text-2xl font-bold mb-6">Quản lý địa chính</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Danh sách tỉnh/thành */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-semibold">Tỉnh/Thành phố</h2>
                <button
                  className="p-1 rounded hover:bg-blue-100"
                  onClick={handleAddProvince}
                  title="Thêm tỉnh/thành"
                >
                  <PlusIcon className="w-5 h-5 text-blue-600" />
                </button>
              </div>
              <ul>
                {provinces.map((p, idx) => (
                  <li
                    key={p.code}
                    className={`flex items-center justify-between px-2 py-1 rounded cursor-pointer ${
                      selectedProvince?.code === p.code
                        ? "bg-blue-50 font-bold"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => {
                      setSelectedProvince(p);
                      setSelectedDistrict(null);
                    }}
                  >
                    <span>
                      {p.name}
                      {p.phone_code && (
                        <span className="text-xs text-gray-400 ml-1">
                          ({p.phone_code})
                        </span>
                      )}
                    </span>
                    <span className="flex gap-1">
                      <button
                        className="p-1 hover:bg-gray-100 rounded"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditProvince(idx);
                        }}
                        title="Sửa"
                      >
                        <PencilIcon className="w-4 h-4 text-gray-500" />
                      </button>
                      <button
                        className="p-1 hover:bg-red-100 rounded"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProvince(idx);
                        }}
                        title="Xóa"
                      >
                        <TrashIcon className="w-4 h-4 text-red-500" />
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            {/* Danh sách quận/huyện */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-semibold">Quận/Huyện</h2>
                <button
                  className="p-1 rounded hover:bg-blue-100"
                  onClick={handleAddDistrict}
                  disabled={!selectedProvince}
                  title="Thêm quận/huyện"
                >
                  <PlusIcon className="w-5 h-5 text-blue-600" />
                </button>
              </div>
              {selectedProvince ? (
                <ul>
                  {selectedProvince.districts.map((d, idx) => (
                    <li
                      key={d.code}
                      className={`flex items-center justify-between px-2 py-1 rounded cursor-pointer ${
                        selectedDistrict?.code === d.code
                          ? "bg-blue-50 font-bold"
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => setSelectedDistrict(d)}
                    >
                      <span>{d.name}</span>
                      <span className="flex gap-1">
                        <button
                          className="p-1 hover:bg-gray-100 rounded"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditDistrict(idx);
                          }}
                          title="Sửa"
                        >
                          <PencilIcon className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          className="p-1 hover:bg-red-100 rounded"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteDistrict(idx);
                          }}
                          title="Xóa"
                        >
                          <TrashIcon className="w-4 h-4 text-red-500" />
                        </button>
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-gray-400 text-sm mt-4">
                  Chọn tỉnh/thành phố
                </div>
              )}
            </div>
            {/* Danh sách phường/xã */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-semibold">Phường/Xã</h2>
                <button
                  className="p-1 rounded hover:bg-blue-100"
                  onClick={handleAddWard}
                  disabled={!selectedDistrict}
                  title="Thêm phường/xã"
                >
                  <PlusIcon className="w-5 h-5 text-blue-600" />
                </button>
              </div>
              {selectedDistrict ? (
                <ul>
                  {selectedDistrict.wards.map((w, idx) => (
                    <li
                      key={idx}
                      className="flex items-center justify-between px-2 py-1 rounded hover:bg-gray-50"
                    >
                      <span>{w.name}</span>
                      <span className="flex gap-1">
                        <button
                          className="p-1 hover:bg-gray-100 rounded"
                          onClick={() => handleEditWard(idx)}
                          title="Sửa"
                        >
                          <PencilIcon className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          className="p-1 hover:bg-red-100 rounded"
                          onClick={() => handleDeleteWard(idx)}
                          title="Xóa"
                        >
                          <TrashIcon className="w-4 h-4 text-red-500" />
                        </button>
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-gray-400 text-sm mt-4">
                  Chọn quận/huyện
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
