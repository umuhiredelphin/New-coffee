import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { FaHistory } from "react-icons/fa";

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch order history from API (dummy example for now)
    const fetchOrders = async () => {
      setLoading(true);
      try {
        // Replace with your real API
        const response = await fetch("http://localhost:5000/api/order-history");
        const data = await response.json();
        setOrders(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3"
      >
        <FaHistory /> Order History
      </motion.h1>

      {loading ? (
        <p className="text-gray-600 text-lg">Loading order history...</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-600 text-lg">No previous orders found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="rounded-2xl shadow-md">
                <CardContent className="p-4">
                  <h2 className="text-xl font-semibold text-gray-800">Order #{order.id}</h2>
                  <p className="text-gray-600 mt-1">Table: {order.table}</p>
                  <p className="text-gray-600">Items: {order.items}</p>
                  <p className="text-gray-600">Total: {order.total} FRW</p>
                  <p className="text-gray-500 text-sm mt-2">{order.time}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <div className="mt-6">
        <Button className="rounded-2xl px-6 py-2 text-lg">Refresh</Button>
      </div>
    </div>
  );
}
