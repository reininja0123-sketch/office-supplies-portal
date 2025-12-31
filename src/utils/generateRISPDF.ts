import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import bagongPilipinasLogo from "@/assets/bagong-pilipinas-logo.jpg";
import dohLogo from "@/assets/doh-logo.png";

interface OrderItem {
  product: {
    id: string;
    name: string;
    sku: string;
    price: number;
    stock_quantity: number;
  };
  quantity: number;
  approved_quantity?: number;
  approval_status?: string;
}

interface ApprovalInfo {
  approvedBy?: string;
  approvedAt?: Date;
  issuedBy?: string;
}

interface RISData {
  orderId: string;
  userName: string;
  userEmail: string;
  items: OrderItem[];
  total: number;
  date: Date;
  division?: string;
  office?: string;
  purpose?: string;
  status?: string;
  approvalInfo?: ApprovalInfo;
}

export const generateRISPDF = async (data: RISData): Promise<jsPDF> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Add logos
  try {
    doc.addImage(bagongPilipinasLogo, "JPEG", 15, 8, 25, 25);
    doc.addImage(dohLogo, "PNG", pageWidth - 40, 8, 25, 25);
  } catch (e) {
    console.warn("Could not load logos:", e);
  }
  
  // Header - Right side document info box
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  
  const boxX = pageWidth - 65;
  doc.rect(boxX, 5, 60, 30);
  doc.text("Code: PNAC-SU-RIS", boxX + 2, 11);
  doc.text("Revision No: 01", boxX + 2, 17);
  doc.text("Eff. Date: October 18, 2024", boxX + 2, 23);
  doc.text(`RIS No: ${data.orderId.slice(0, 8).toUpperCase()}`, boxX + 2, 29);
  
  // Title section
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Appendix 63", pageWidth / 2, 10, { align: "center" });
  
  doc.setFontSize(10);
  doc.text("Republic of the Philippines", pageWidth / 2, 16, { align: "center" });
  doc.text("DEPARTMENT OF HEALTH", pageWidth / 2, 22, { align: "center" });
  doc.text("Philippine National AIDS Council", pageWidth / 2, 28, { align: "center" });
  
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("REQUISITION AND ISSUE SLIP", pageWidth / 2, 42, { align: "center" });
  
  // Entity info section
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const infoY = 50;
  const col1X = 15;
  const col2X = pageWidth / 2 + 10;
  
  doc.text(`Entity Name: PHILIPPINE NATIONAL AIDS COUNCIL`, col1X, infoY);
  doc.text(`Fund Cluster: 01`, col2X, infoY);
  
  doc.text(`Division: ${data.division || "ADMINISTRATIVE DIVISION"}`, col1X, infoY + 6);
  doc.text(`Responsibility Center Code: 13-004-00-0000000`, col2X, infoY + 6);
  
  doc.text(`Office: ${data.office || "PHILIPPINE NATIONAL AIDS COUNCIL"}`, col1X, infoY + 12);
  doc.text(`RIS No.: ${data.orderId.slice(0, 16).toUpperCase()}`, col2X, infoY + 12);
  
  // Items table - use approved quantities if available
  const isApproved = data.status && ["processing", "completed", "partial"].includes(data.status);
  
  const tableData = data.items.map((item, index) => {
    const requestedQty = item.quantity;
    const approvedQty = item.approved_quantity ?? item.quantity;
    const stockAvailable = item.product.stock_quantity >= requestedQty ? "YES" : "NO";
    const issueQty = isApproved ? approvedQty : requestedQty;
    const remarks = item.approval_status === "rejected" ? "REJECTED" : 
                   (item.approved_quantity !== undefined && item.approved_quantity < item.quantity) ? "PARTIAL" : "";
    
    return [
      item.product.sku || `ITEM-${String(index + 1).padStart(3, "0")}`,
      "PIECE",
      item.product.name.toUpperCase(),
      requestedQty.toString(),
      stockAvailable,
      issueQty.toString(),
      remarks,
    ];
  });
  
  // Add "NOTHING FOLLOWS" row
  tableData.push(["", "", "****** NOTHING FOLLOWS ******", "", "", "", ""]);
  
  autoTable(doc, {
    startY: infoY + 20,
    head: [["Stock No.", "Unit", "Description", "Qty", "Stock Available?", "Issue Qty", "Remarks"]],
    body: tableData,
    theme: "grid",
    styles: {
      fontSize: 8,
      cellPadding: 2,
      halign: "center",
      valign: "middle",
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      lineWidth: 0.5,
    },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 18 },
      2: { cellWidth: 65, halign: "left" },
      3: { cellWidth: 15 },
      4: { cellWidth: 25 },
      5: { cellWidth: 20 },
      6: { cellWidth: 22 },
    },
  });
  
  // Get final Y position after table
  const finalY = (doc as any).lastAutoTable.finalY || 150;
  
  // Purpose section
  doc.setFontSize(9);
  doc.text(`Purpose: ${data.purpose || "This Office Supplies will be used by PNAC Personnel."}`, col1X, finalY + 10);
  
  // Disapproval reason line
  doc.text("If disapprove, provide the reason:", col1X, finalY + 18);
  doc.line(col1X + 55, finalY + 18, pageWidth - 15, finalY + 18);
  
  // Approve/Disapprove checkboxes - fill based on status
  const isRejected = data.status === "rejected";
  const isApprovedStatus = data.status && ["processing", "completed", "partial"].includes(data.status);
  
  doc.rect(col1X, finalY + 23, 4, 4);
  if (isApprovedStatus) {
    doc.setFillColor(0, 0, 0);
    doc.rect(col1X, finalY + 23, 4, 4, "F");
  }
  doc.text("Approve", col1X + 6, finalY + 26);
  
  doc.rect(col1X + 30, finalY + 23, 4, 4);
  if (isRejected) {
    doc.setFillColor(0, 0, 0);
    doc.rect(col1X + 30, finalY + 23, 4, 4, "F");
  }
  doc.text("Disapprove", col1X + 36, finalY + 26);
  
  // Signature section
  const sigY = finalY + 35;
  const sigColWidth = (pageWidth - 30) / 4;
  
  const sigLabels = ["Requested by:", "Approved by:", "Issued by:", "Received by:"];
  const sigDesignations = [
    "ADMINISTRATIVE OFFICER I",
    "SUPERVISING ADMINISTRATIVE OFFICER",
    "ADMINISTRATIVE OFFICER I (SUPPLY)",
    "ADMINISTRATIVE OFFICER I",
  ];
  
  sigLabels.forEach((label, i) => {
    const x = col1X + i * sigColWidth;
    doc.setFont("helvetica", "bold");
    doc.text(label, x, sigY);
    doc.setFont("helvetica", "normal");
    
    doc.text("Signature:", x, sigY + 8);
    doc.line(x + 18, sigY + 8, x + sigColWidth - 5, sigY + 8);
    
    doc.text("Printed Name:", x, sigY + 16);
    
    // Fill in names based on role
    if (i === 0 || i === 3) {
      // Requested by / Received by = customer
      doc.setFont("helvetica", "bold");
      doc.text(data.userName.toUpperCase(), x, sigY + 22);
      doc.setFont("helvetica", "normal");
    } else if (i === 1 && data.approvalInfo?.approvedBy) {
      // Approved by
      doc.setFont("helvetica", "bold");
      doc.text(data.approvalInfo.approvedBy.toUpperCase(), x, sigY + 22);
      doc.setFont("helvetica", "normal");
    } else if (i === 2 && data.approvalInfo?.issuedBy) {
      // Issued by
      doc.setFont("helvetica", "bold");
      doc.text(data.approvalInfo.issuedBy.toUpperCase(), x, sigY + 22);
      doc.setFont("helvetica", "normal");
    } else {
      doc.line(x + 22, sigY + 16, x + sigColWidth - 5, sigY + 16);
    }
    
    doc.text("Designation:", x, sigY + 30);
    doc.setFontSize(7);
    doc.text(sigDesignations[i], x, sigY + 36);
    doc.setFontSize(9);
    
    doc.text("Date:", x, sigY + 44);
    // Use approval date for approved/issued, order date for requested/received
    const dateToUse = (i === 1 || i === 2) && data.approvalInfo?.approvedAt 
      ? data.approvalInfo.approvedAt 
      : data.date;
    const dateStr = dateToUse.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    doc.text(dateStr, x + 10, sigY + 44);
  });
  
  return doc;
};

export const downloadRISPDF = async (data: RISData): Promise<void> => {
  const doc = await generateRISPDF(data);
  doc.save(`RIS-${data.orderId.slice(0, 8).toUpperCase()}.pdf`);
};
