import { Metadata } from "next";
import PageContainer from "@/components/container/PageContainer";
import { WarehouseProvider } from "@/contexts/WarehouseContext";

export const metadata: Metadata = {
  title: "Warehouse Management",
  description: "This is the warehouse management section",
};

export default function WarehouseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WarehouseProvider>
      <PageContainer>
        {children}
      </PageContainer>
    </WarehouseProvider>
  );
}
