document.addEventListener("DOMContentLoaded", function () {
    const excelDataInput = document.getElementById("excelData");
    const classNameInput = document.getElementById("className");
    const amountInput = document.getElementById("amount");
    const generateButton = document.getElementById("generateReceipt");
    const increaseButton = document.getElementById("increaseAmount");
    const decreaseButton = document.getElementById("decreaseAmount");
    const invoiceContainer = document.getElementById("invoiceContainer");
    const receiptDiv = document.getElementById("receipt");
    const downloadButton = document.getElementById("downloadButton");
  
    let studentName = "";
    let currentStudentName = "";
  
    function isLeapYear(year) {
      return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    }
  
    function isValidDate(day, month, year) {
      const daysInMonth = [
        31,
        isLeapYear(year) ? 29 : 28,
        31,
        30,
        31,
        30,
        31,
        31,
        30,
        31,
        30,
        31,
      ];
      return (
        month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth[month - 1]
      );
    }
  
    generateButton.addEventListener("click", function () {
      const excelData = excelDataInput.value.trim();
      const className = classNameInput.value.trim();
      const amount = parseInt(amountInput.value, 10) || 0;
  
      studentName = "";
      currentStudentName = studentName;
  
      let validDates = [];
      let paymentDate = "";
      let isPaid = false;
      //const currentYear = new Date().getFullYear();
  
      if (!excelData || !className || !amount) {
        alert("⚠️ Vui lòng nhập đầy đủ thông tin!");
        return;
      }
  
      const parts = excelData.split(/\t+|\s+/).filter(Boolean);
      if (parts.length < 2 || !/[a-zA-Z]/.test(parts[0])) {
        alert("❌ Dữ liệu từ Excel không hợp lệ.");
        return;
      }
  
     //const invoiceType = document.querySelector('input[name="invoiceType"]:checked').value;
   const invoiceRadio = document.querySelector('input[name="invoiceType"]:checked');
   const invoiceType = invoiceRadio ? invoiceRadio.value : "past"; // Mặc định là quá khứ
   
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    for (let i = 0; i < parts.length; i++) {
      if (parts[i].toLowerCase().includes("đóng")) {
        isPaid = true;
        paymentDate = parts[i + 1] || "";
        break;
      }

      const hasK = parts[i].startsWith("k");
      const tokens = parts[i].replace("k", "").split("/");

      if (tokens.length === 2) {
        const day = parseInt(tokens[0], 10);
        const month = parseInt(tokens[1], 10);
        let year = currentYear;

        if (invoiceType === "past") {
          // Nếu chọn quá khứ: giữ logic cũ
          if (
            month > currentDate.getMonth() + 1 ||
            (month === currentDate.getMonth() + 1 && day > currentDate.getDate())
          ) {
            year = currentYear - 1;
          }
        } else if (invoiceType === "future") {
          // Nếu chọn tương lai: luôn dùng năm hiện tại
          year = currentYear;
        }

        if (isValidDate(day, month, year)) {
          validDates.push({
            date: `${tokens[0].padStart(2, "0")}/${tokens[1].padStart(2, "0")}/${year}`,
            status: hasK ? "Nghỉ không phép" : "Có học",
          });
        }
      } else {
        studentName += (studentName ? " " : "") + parts[i];
      }
    }
  
      validDates.sort(
        (a, b) =>
          new Date(a.date.split("/").reverse().join("/")) -
          new Date(b.date.split("/").reverse().join("/"))
      );
      const receipt = {
        currentStudentName,
        studentName,
        className,
        amount,
        attendanceDates: validDates,
        isPaid,
        paymentDate,
      };
      renderInvoice(receipt);
      invoiceContainer.style.display = "block";
      currentStudentName = studentName;
    });
  
    // Nút "Tạo hóa đơn":
    function renderInvoice(data) {
      let html = "";
  
      html +=
        '<p style="text-align: right;"><i>Ngày Lập: ' +
        new Date().toLocaleDateString("vi-VN") +
        "</i></p>";
      html += "<br>";
  
      // Header hóa đơn
      html += '<div class="invoice-header">';
      html += "<h2 style='text-align: center;'>BIÊN LAI HỌC PHÍ</h2>";
      html += "</div>";
      html += "<br>";
  
      // Thông tin hóa đơn
      html += '<div class="invoice-details">';
      html += "</div>";
  
      html += `<p><strong>Học sinh:</strong> ${data.studentName}</p>`;
      html += `<p><strong>Lớp:</strong> ${data.className}</p>`;
      html += `<p><strong>Số tiền:</strong> ${data.amount.toLocaleString(
        "vi-VN"
      )} đ</p>`;
      html += "<h3>Bảng điểm danh</h3>";
      html +=
        "<table style='margin: auto;'><thead><tr><th style='text-align: center;'>Buổi</th><th style='text-align: center;'>Ngày</th><th style='text-align: center;'>Trạng thái</th></tr></thead><tbody>";
      data.attendanceDates.forEach((entry, index) => {
        html += `<tr><td style="text-align: center;">${
          index + 1
        }</td><td style="text-align: center;">${
          entry.date
        }</td><td style="text-align: center;">${entry.status}</td></tr>`;
      });
      html += "</tbody></table>";
  
      if (data.isPaid) {
        html += "<br>";
  
        html += `<p><i>* Đã thanh toán ngày: ${
          data.paymentDate || "Không rõ"
        }</i></p>`;
  
        html += "<br>";
      } else {
        // Thông tin thanh toán với mã QR
        html += "<br>";
        html += '<div class="qr-section">';
        html += "<h4>Quét mã để thanh toán</h4>";
        html += '<img src="./qr.png" alt="QR Code"/>';
        html += '<p style="margin: 2px 0;">Vietcombank </p>';
        html += '<p style="margin: 2px 0;">1024112913</p>';
        html += '<p style="margin: 2px 0;">Nguyen Thien Thanh</p>';
      }
  
      receiptDiv.innerHTML = html;
    }
  
    // Nút "Tải hóa đơn":
    downloadButton.addEventListener("click", function () {
      if (
        !invoiceContainer.style.display ||
        invoiceContainer.style.display === "none"
      ) {
        alert("⚠ Không có dữ liệu hóa đơn để tải xuống!");
        return;
      }
  
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
  
      const fileName = `${currentStudentName.replace(
        /\s+/g,
        "_"
      )}_bien_lai_${month}_${year}.png`;
  
      // Đảm bảo ảnh QR được tải hoàn toàn trước khi chụp
      const qrImg = document.querySelector("#receipt img");
      if (qrImg && !qrImg.complete) {
        qrImg.onload = () => captureReceipt(fileName);
      } else {
        captureReceipt(fileName);
      }
    });
  
    function captureReceipt(fileName) {
      html2canvas(receiptDiv, {
        scale: 2, // Độ phân giải cao hơn
        useCORS: true, // Hỗ trợ ảnh từ nguồn bên ngoài
        backgroundColor: "#fff", // Đảm bảo nền trắng
      })
        .then((canvas) => {
          const link = document.createElement("a");
          link.href = canvas.toDataURL("image/png");
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        })
        .catch((error) => {
          console.error("❌ Lỗi khi tạo ảnh:", error);
          alert("Không thể tạo ảnh hóa đơn. Vui lòng thử lại!");
        });
    }
  
    // Nút "+100k":
    increaseButton.addEventListener("click", function () {
      amountInput.value = (parseInt(amountInput.value, 10) || 0) + 50000;
    });
  
    // Nút "-100k":
    decreaseButton.addEventListener("click", function () {
      const newValue = (parseInt(amountInput.value, 10) || 0) - 50000;
      amountInput.value = newValue >= 0 ? newValue : 0;
    });
  
    // Nút "Biên Lai Mới":
    resetButton.addEventListener("click", function () {
      receiptDiv.innerHTML = "";
      invoiceContainer.style.display = "none";
      excelDataInput.value = "";
      classNameInput.value = "";
      currentStudentName = "";
    });
  });
  