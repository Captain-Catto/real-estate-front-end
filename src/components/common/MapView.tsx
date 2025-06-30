import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Các URL base64 cho icon
const ICON_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAApCAYAAADAk4LOAAAFgUlEQVR4Aa1XA5BjWRTN2oW17d3YaZtr2962HUzbDNpjszW24mRt28p47v7zq/bXZtrp/lWnXr337j3nPCe85NcypgSFdugCpW5YoDAMRaIMqRi6aKq5E3YqDQO3qAwjVWrD8Ncq/RBpykd8oZUb/kaJutow8r1aP9II0WmLKLIsJyv1w/kqw9Ch2MYdB++12Onxee/QMwvf4/Dk/Lfp/i4nxTXtOoQ4pW5Aj7wpici1A9erdAN2OH64x8OSP9j3Ft3b7aWkTg/Fm91siTra0f9on5sQr9INejH6CUUUpavjFNq1B+Oadhxmnfa8RfEmN8VNAsQhPqF55xHkMzz3jSmChWU6f7/XZKNH+9+hBLOHYozuKQPxyMPUKkrX/K0uWnfFaJGS1QPRtZsOPtr3NsW0uyh6NNCOkU3Yz+bXbT3I8G3xE5EXLXtCXbbqwCO9zPQYPRTZ5vIDXD7U+w7rFDEoUUf7ibHIR4y6bLVPXrz8JVZEql13trxwue/uDivd3fkWRbS6/IA2bID4uk0UpF1N8qLlbBlXs4Ee7HLTfV1j54APvODnSfOWBqtKVvjgLKzF5YdEk5ewRkGlK0i33Eofffc7HT56jD7/6U+qH3Cx7SBLNntH5YIPvODnyfIXZYRVDPqgHtLs5ABHD3YzLuespb7t79FY34DjMwrVrcTuwlT55YMPvOBnRrJ4VXTdNnYug5ucHLBjEpt30701A3Ts+HEa73u6dT3FNWwflY86eMHPk+Yu+i6pzUpRrW7SNDg5JHR4KapmM5Wv2E8Tfcb1HoqqHMHU+uWDD7zg54mz5/2BSnizi9T1Dg4QQXLToGNCkb6tb1NU+QAlGr1++eADrzhn/u8Q2YZhQVlZ5+CAOtqfbhmaUCS1ezNFVm2imDbPmPng5wmz+gwh+oHDce0eUtQ6OGDIyR0uUhUsoO3vfDmmgOezH0mZN59x7MBi++WDL1g/eEiU3avlidO671bkLfwbw5XV2P8Pzo0ydy4t2/0eu33xYSOMOD8hTf4CrBtGMSoXfPLchX+J0ruSePw3LZeK0juPJbYzrhkH0io7B3k164hiGvawhOKMLkrQLyVpZg8rHFW7E2uHOL888IBPlNZ1FPzstSJM694fWr6RwpvcJK60+0HCILTBzZLFNdtAzJaohze60T8qBzyh5ZuOg5e7uwQppofEmf2++DYvmySqGBuKaicF1blQjhuHdvCIMvp8whTTfZzI7RldpwtSzL+F1+wkdZ2TBOW2gIF88PBTzD/gpeREAMEbxnJcaJHNHrpzji0gQCS6hdkEeYt9DF/2qPcEC8RM28Hwmr3sdNyht00byAut2k3gufWNtgtOEOFGUwcXWNDbdNbpgBGxEvKkOQsxivJx33iow0Vw5S6SVTrpVq11ysA2Rp7gTfPfktc6zhtXBBC+adRLshf6sG2RfHPZ5EAc4sVZ83yCN00Fk/4kggu40ZTvIEm5g24qtU4KjBrx/BTTH8ifVASAG7gKrnWxJDcU7x8X6Ecczhm3o6YicvsLXWfh3Ch1W0k8x0nXF+0fFxgt4phz8QvypiwCCFKMqXCnqXExjq10beH+UUA7+nG6mdG/Pu0f3LgFcGrl2s0kNNjpmoJ9o4B29CMO8dMT4Q5ox8uitF6fqsrJOr8qnwNbRzv6hSnG5wP+64C7h9lp30hKNtKdWjtdkbuPA19nJ7Tz3zR/ibgARbhb4AlhavcBebmTHcFl2fvYEnW0ox9xMxKBS8btJ+KiEbq9zA4RthQXDhPa0T9TEe69gWupwc6uBUphquXgf+/FrIjweHQS4/pduMe5ERUMHUd9xv8ZR98CxkS4F2n3EUrUZ10EYNw7BWm9x1GiPssi3GgiGRDKWRYZfXlON+dfNbM+GgIwYdwAAAAASUVORK5CYII=";
const ICON_2X_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAABSCAMAAAAhFXfZAAAC91BMVEVMaXEzeak2f7I4g7g3g7c3grY3grb///83grY3grb///////////82grc3g7j///82grcmJiYmJiYmJiY3grb///////////82grcmJiYmJiYmJiYmJiYmJiYmJiYmJiY3grb///82grcmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiY3grb////////9/f3///82grcmJib///8mJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiZoJFE4AAAA/HRSTlMAAgEE/v0F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";
const SHADOW_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACkAAAApCAQAAAACach9AAACMUlEQVR4Ae3ShY7jQBAE0Aoz/f9/HTMzhg1zrdKUrJbdx+Kd2nD8VNudfsL/Th///dyQN2TH6f3y/BGpC379rV+S+qqetBOxImNQXL8JCAr2V4iMQXHGNJxeCfZXhSRBcQMfvkOWUdtfzlLgAENmZDcmo2TVmt8OSM2eXxBp3DjHSMFutqS7SbmemzBiR+xpKCNUIRkdkkYxhAkyGoBvyQFEJEefwSmmvBfJuJ6aKqKWnAkvGZOaZXTUgFqYULWNSHUckZuR1HIIimUExutRxwzOLROIG4vKmCKQt364mIlhSyzAf1m9lHZHJZrlAOMMztRRiKimp/rpdJDc9Awry5xTZCte7FHtuS8wJgeYGrex28xNTd086Dik7vUMscQOa8y4DoGtCCSkAKlNwpgNtphjrC6MIHUkR6YWxxs6Sc5xqn222mmCRFzIt8lEdKx+ikCtg91qS2WpwVfBelJCiQJwvzixfI9cxZQWgiSJelKnwBElKYtDOb2MFbhmUigbReQBV0Cg4+qMXSxXSyGUn4UbF8l+7qdSGnTC0XLCmahIgUHLhLOhpVCtw4CzYXvLQWQbJNmxoCsOKAxSgBJno75avolkRw8iIAFcsdc02e9iyCd8tHwmeSSoKTowIgvscSGZUOA7PuCN5b2BX9mQM7S0wYhMNU74zgsPBj3HU7wguAfnxxjFQGBE6pwN+GjME9zHY7zGp8wVxMShYX9NXvEWD3HbwJf4giO4CFIQxXScH1/TM+04kkBiAAAAAElFTkSuQmCC";

// Sửa lỗi icon không load trong Next.js
const fixLeafletIcon = () => {
  // Chỉ chạy ở client-side
  if (typeof window !== "undefined") {
    // @ts-ignore
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: ICON_2X_URL,
      iconUrl: ICON_URL,
      shadowUrl: SHADOW_URL,
    });
  }
};

// Vị trí mặc định: Hồ Chí Minh
const DEFAULT_POSITION = {
  lat: 10.7769,
  lng: 106.7009,
};

export default function MapView({ osmData }: { osmData?: OSMData }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [mapKey, setMapKey] = useState(Date.now());

  // Xử lý dữ liệu từ OSM hoặc dùng vị trí mặc định
  const lat = osmData?.lat ? parseFloat(osmData.lat) : DEFAULT_POSITION.lat;
  const lng = osmData?.lon ? parseFloat(osmData.lon) : DEFAULT_POSITION.lng;

  // Fix Leaflet icon và đánh dấu đã render ở client
  useEffect(() => {
    setIsClient(true);
    fixLeafletIcon();

    // Cleanup khi component unmount
    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Tạo map mới khi có dữ liệu
  useEffect(() => {
    if (!isClient || !mapRef.current) return;

    // Tạo ID ngẫu nhiên mới để buộc tạo map mới
    setMapKey(Date.now());

    // Cleanup map cũ nếu có
    if (leafletMapRef.current) {
      leafletMapRef.current.remove();
      leafletMapRef.current = null;
    }

    // Tạo map mới sau 100ms để đảm bảo DOM đã cập nhật
    const timer = setTimeout(() => {
      try {
        // Tạo map mới với các tùy chọn để tăng tính ổn định
        const map = L.map(mapRef.current!, {
          zoomControl: true,
          attributionControl: false,
          fadeAnimation: false,
          zoomAnimation: false,
        }).setView([lat, lng], 15);

        // Thêm tile layer
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        // Tạo icon marker tùy chỉnh
        const customIcon = new L.Icon({
          iconUrl: ICON_URL,
          iconRetinaUrl: ICON_2X_URL,
          shadowUrl: SHADOW_URL,
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        });

        // Thêm marker với icon tùy chỉnh
        L.marker([lat, lng], { icon: customIcon }).addTo(map);

        // Xử lý boundingbox nếu có
        if (osmData?.boundingbox && osmData.boundingbox.length === 4) {
          try {
            const southWest = L.latLng(
              parseFloat(osmData.boundingbox[0]),
              parseFloat(osmData.boundingbox[2])
            );

            const northEast = L.latLng(
              parseFloat(osmData.boundingbox[1]),
              parseFloat(osmData.boundingbox[3])
            );

            const bounds = L.latLngBounds(southWest, northEast);

            // Thêm rectangle
            L.rectangle(bounds, { color: "blue", weight: 1 }).addTo(map);

            // Thêm timeout trước khi fit bounds để tránh lỗi
            setTimeout(() => {
              // Sử dụng tham chiếu leafletMapRef.current thay vì map
              if (leafletMapRef.current) {
                try {
                  leafletMapRef.current.fitBounds(bounds);
                } catch (err) {
                  console.error("Error fitting bounds:", err);
                }
              }
            }, 300);
          } catch (error) {
            console.error("Error creating bounds:", error);
          }
        }

        // Lưu map reference
        leafletMapRef.current = map;
      } catch (error) {
        console.error("Error creating map:", error);
      }
    }, 300); // Tăng timeout lên 300ms

    return () => clearTimeout(timer);
  }, [isClient, lat, lng, osmData]);

  // Hiển thị placeholder khi chưa render client-side
  if (!isClient) {
    return (
      <div className="h-[300px] w-full bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Đang tải bản đồ...</p>
      </div>
    );
  }

  return (
    <div
      className="h-[300px] w-full rounded-lg overflow-hidden relative"
      key={`map-container-${mapKey}`}
    >
      <div ref={mapRef} className="h-full w-full" />
    </div>
  );
}
