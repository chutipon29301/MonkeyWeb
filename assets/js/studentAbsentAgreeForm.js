$("#submitButt").click(function () {
    if (confirm("การกดยืนยันถือเป็นการรับทราบ \"ข้อกำหนดและเงื่อนไขการลา\" ทั้งหมดแน่ใจหรือไม่ ?")) {
        self.location = "/absentForm";
    }
});