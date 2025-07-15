"use client";
import React from "react";
import { DisplayMap } from "@/components/property-detail/DisplayMap";

export default function TestMapPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          Test OpenStreetMap Implementation
        </h1>

        {/* Test 1: Vinhomes Central Park project coordinates */}
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Test 1: Project có tọa độ (Vinhomes Central Park)
          </h2>
          <DisplayMap
            latitude={22}
            longitude={11}
            title="Vinhomes Central Park"
            address="abc"
          />
        </div>

        {/* Test 2: Hà Nội coordinates */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Test 2: Tọa độ Hà Nội</h2>
          <DisplayMap
            latitude={21.0285}
            longitude={105.8542}
            title="Test Property in Hanoi"
            address="Hà Nội, Việt Nam"
          />
        </div>

        {/* Test 3: TP.HCM coordinates */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Test 3: Tọa độ TP.HCM</h2>
          <DisplayMap
            latitude={10.8231}
            longitude={106.6297}
            title="Test Property in HCMC"
            address="TP. Hồ Chí Minh, Việt Nam"
          />
        </div>

        {/* Test 4: Không có tọa độ */}
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Test 4: Không có tọa độ (fallback)
          </h2>
          <DisplayMap
            title="Property without coordinates"
            address="Somewhere in Vietnam"
          />
        </div>
      </div>
    </div>
  );
}
