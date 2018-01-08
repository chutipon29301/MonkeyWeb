$("#submitButt").click(function () {
    if (confirm("การกดยืนยันถือเป็นการรับทราบ \"ข้อกำหนดและเงื่อนไขการเพิ่ม\" ทั้งหมดแน่ใจหรือไม่ ?")) {
        self.location = "/addForm";
    }
});