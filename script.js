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
      let excelData = excelDataInput.value.trim();
      const className = classNameInput.value.trim();
      const amount = parseInt(amountInput.value, 10) || 0;

      studentName = "";
      currentStudentName = studentName;

      let validDates = [];
      let paymentDate = "";
      let isPaid = false;

      if (!excelData || !className || !amount) {
        alert("Vui lòng nhập đầy đủ thông tin!");
        return;
      }

      // Chuẩn hóa ký tự “⁄” thành “/”
      excelData = excelData.replace(/⁄/g, "/");

      const parts = excelData.split(/\s+/).filter(Boolean);
      const invoiceRadio = document.querySelector('input[name="invoiceType"]:checked');
      const invoiceType = invoiceRadio ? invoiceRadio.value : "past"; 
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();

      // Hàm kiểm tra marker X (KHÔNG nhầm Xuân)
      const isXMarker = (token) => /^x(\([^)]+\))?$/i.test(token);

      // Hàm kiểm tra token ngày
      const isDateToken = (token) => /^k?\d{1,2}\/\d{1,2}$/.test(token);

      // Tìm vị trí bắt đầu của danh sách ngày
      let dateIndex = parts.findIndex(t => isXMarker(t) || isDateToken(t));

      // Nếu không có token ngày/X → toàn bộ coi là tên
      if (dateIndex === -1) {
        studentName = parts.join(" ");
        dateIndex = parts.length;
      } else {
        studentName = parts.slice(0, dateIndex).join(" ");
      }

      // Xử lý phần ngày và dấu X sau tên
      for (let i = dateIndex; i < parts.length; i++) {
        const token = parts[i];

        // Nếu token là X hoặc X(ngày thanh toán)
        if (isXMarker(token)) {
          isPaid = true;
          const matched = token.match(/\(([^)]+)\)/);
          paymentDate = matched ? matched[1] : "";
          continue;
        }

        // Nếu token là ngày
        if (isDateToken(token)) {
          const hasK = token.toLowerCase().startsWith("k");
          const cleaned = token.replace(/k/i, "");
          const [d, m] = cleaned.split("/");
          let day = parseInt(d, 10);
          let month = parseInt(m, 10);
          let year = currentYear;

          const now = new Date();
          const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

          if (invoiceType === "past") {
            if (month > currentDate.getMonth() + 1 || (month === currentDate.getMonth() + 1 && day > currentDate.getDate())) {
              year = currentYear - 1;
            }
          } else if (invoiceType === "future") {
            year = currentYear;
            if (currentDate.getMonth() + 1 >= 10 && month <= 3) {
              year = currentYear + 1;
            }
          }

          if (isValidDate(day, month, year)) {
            const dateObj = new Date(year, month - 1, day);
            let status = "Có học";

            if (invoiceType === "future" && dateObj > today) status = "Dự kiến";
            else if (hasK) status = "Nghỉ không phép";

            validDates.push({
              date: `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`,
              status,
            });
          }
        }
      }

      // Sắp xếp ngày
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
  