import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { type Complaint } from "@/lib/types";
import { ComplaintCard } from "./complaint-card";
import { cn } from "@/lib/utils";

// Fix for default marker icons in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface MapViewProps {
    complaints: Complaint[];
    className?: string;
}

// Generate pseudo-random coordinates for a given string (like a village/district)
// Centered roughly around India
const getCoordsForString = (str: string): [number, number] => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Base coordinates around central India (Madhya Pradesh roughly)
    const baseLat = 22.9;
    const baseLng = 78.6;

    // Add some pseudo-random offset based on the hash
    // Modulo allows wrapping within a certain degree range
    const latOffset = (hash % 1000) / 100; // max +/- 10 degrees
    const lngOffset = ((hash >> 4) % 1000) / 100; // max +/- 10 degrees

    return [baseLat + latOffset, baseLng + lngOffset];
};

export function MapView({ complaints, className }: MapViewProps) {
    // Center of India roughly
    const defaultCenter: [number, number] = [22.9, 78.6];

    return (
        <div className={cn("h-[600px] w-full rounded-2xl overflow-hidden border border-border shadow-sm", className)}>
            <MapContainer center={defaultCenter} zoom={5} className="h-full w-full">
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {complaints.map((complaint) => {
                    const locStr = `${complaint.location?.village || ""}-${complaint.location?.district || ""}-${complaint.location?.state || ""}-${complaint.id}`;
                    const coords = getCoordsForString(locStr);

                    return (
                        <Marker key={complaint.id} position={coords}>
                            <Popup className="min-w-[300px] !p-0 max-w-[350px]">
                                <div className="p-0 m-0">
                                    <ComplaintCard complaint={complaint} className="border-0 shadow-none -m-3 max-h-[300px] overflow-y-auto" />
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
}
