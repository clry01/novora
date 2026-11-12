
"use client";

import { useEffect, useState } from "react";

type OrderDateProps = {
  date: string;
};

export default function OrderDate({ date }: OrderDateProps) {
  const [formattedDate, setFormattedDate] = useState("");

  useEffect(() => {
    setFormattedDate(
      new Date(date).toLocaleString("es-PE", {
        dateStyle: "short",
        timeStyle: "short",
        timeZone: "America/Lima",
      })
    );
  }, [date]);

  return <>{formattedDate || "Cargando fecha..."}</>;
}
