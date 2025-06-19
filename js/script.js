document.addEventListener('DOMContentLoaded', function() {
    // --- Elemen DOM Data Master Tagihan ---
    const fileInputMaster = document.getElementById('file-input-master');
    const clearDataMasterBtn = document.getElementById('clear-data-master-btn');
    const loadingIndicatorMaster = document.getElementById('loading-indicator-master');
    const uploadMasterText = document.querySelector('#mini-import-container #file-input-master').previousElementSibling; // Mengambil elemen <label>

    // --- Elemen DOM Data Detail Barang ---
    const fileInputDetail = document.getElementById('file-input-detail');
    const clearDataDetailBtn = document.getElementById('clear-data-detail-btn');
    const loadingIndicatorDetail = document.getElementById('loading-indicator-detail');
    const uploadDetailText = document.querySelector('#mini-import-container #file-input-detail').previousElementSibling; // Mengambil elemen <label>


    // --- Elemen DOM Lainnya ---
    const tabelBody = document.querySelector('#tabel-tagihan tbody');
    const filterCabang = document.getElementById('filter-cabang');
    const filterKategori = document.getElementById('filter-kategori');
    const cariPelanggan = document.getElementById('cari-pelanggan');
    const filterControls = document.getElementById('filter-controls');

    // --- Elemen Header Tabel untuk Sorting ---
    const headerJatuhTempo = document.querySelector('#tabel-tagihan thead th:nth-child(3)'); // Kolom Jatuh Tempo
    const headerPelanggan = document.querySelector('#tabel-tagihan thead th:nth-child(4)'); // Kolom Pelanggan


    // --- Elemen Modal Lunas ---
    const lunasModal = document.getElementById('lunas-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalInvoiceList = document.getElementById('modal-invoice-list');
    const closeModalBtn = document.querySelector('.modal-close');
    const prosesLunasBtn = document.getElementById('proses-lunas-btn');

    // --- Elemen Modal Detail Pelanggan ---
    const detailPelangganModal = document.getElementById('detail-pelanggan-modal');
    const detailModalTitle = document.getElementById('detail-modal-title');
    const detailNamaPelanggan = document.getElementById('detail-nama-pelanggan');
    const detailCabangPelanggan = document.getElementById('detail-cabang-pelanggan');
    const detailNoWaPelanggan = document.getElementById('detail-no-wa-pelanggan');
    const detailInvoiceList = document.getElementById('detail-invoice-list');
    const detailModalCloseBtns = document.querySelectorAll('.detail-modal-close');

    // --- Elemen Modal Konfirmasi Kustom ---
    const customConfirmModal = document.getElementById('custom-confirm-modal');
    const customConfirmTitle = document.getElementById('custom-confirm-title');
    const customConfirmMessage = document.getElementById('custom-confirm-message');
    const customConfirmOkBtn = document.getElementById('custom-confirm-ok');
    const customConfirmCancelBtn = document.getElementById('custom-confirm-cancel');
    const customConfirmCloseBtn = document.querySelector('.modal-close-confirm');

    // --- Elemen Modal Notifikasi Kustom ---
    const customAlertModal = document.getElementById('custom-alert-modal');
    const customAlertTitle = document.getElementById('custom-alert-title');
    const customAlertMessage = document.getElementById('custom-alert-message');
    const customAlertOkBtn = document.getElementById('custom-alert-ok');
    const customAlertCloseBtn = document.querySelector('.modal-close-alert');

    // --- Elemen Modal Manajemen Template Pesan ---
    const templateModalBtn = document.getElementById('template-modal-btn');
    const templateModal = document.getElementById('template-modal');
    const templateModalCloseBtn = document.querySelector('.template-modal-close');
    const templateNameInput = document.getElementById('template-name');
    const templateContentInput = document.getElementById('template-content');
    const saveTemplateBtn = document.getElementById('save-template-btn');
    const newTemplateBtn = document.getElementById('new-template-btn');
    const savedTemplatesList = document.getElementById('saved-templates-list');

    // --- Elemen Badge Notifikasi ---
    const badgeAkanJatuhTempo = document.getElementById('badge-akan-jatuh-tempo');
    const badgeJatuhTempo = document.getElementById('badge-jatuh-tempo');
    const badgeKonfirmasiTerimaBarang = document.getElementById('badge-konfirmasi-terima-barang');

    // --- Elemen Mode Gelap ---
    const darkModeToggle = document.getElementById('dark-mode-toggle');

    // --- Elemen PIN/Admin Modals ---
    const pinAccessModal = document.getElementById('pin-access-modal');
    const pinInput = document.getElementById('pin-input');
    const enterPinBtn = document.getElementById('enter-pin-btn');
    const pinErrorMessage = document.getElementById('pin-error-message');

    const adminLoginModal = document.getElementById('admin-login-modal');
    const adminIdInput = document.getElementById('admin-id-input');
    const adminPasswordInput = document.getElementById('admin-password-input');
    const adminLoginBtn = document.getElementById('admin-login-btn');
    const adminErrorMessage = document.getElementById('admin-error-message');
    const modalCloseAdmin = document.querySelector('.modal-close-admin'); // Tambahkan referensi ini

    const changePinModal = document.getElementById('change-pin-modal');
    const newPinInput = document.getElementById('new-pin-input');
    const confirmNewPinInput = document.getElementById('confirm-new-pin-input');
    const changePinBtn = document.getElementById('change-pin-btn');
    const changePinErrorMessage = document.getElementById('change-pin-error-message');
    const modalCloseChangePin = document.querySelector('.modal-close-change-pin'); // Tambahkan referensi ini

    const openAdminSettingsBtn = document.getElementById('open-admin-settings-btn'); // Tombol untuk membuka pengaturan admin


    let dataMaster = []; // Data tagihan utama
    let dataDetailBarang = {}; // Data detail barang, diindeks oleh No Invoice
    let templates = {}; // Objek untuk menyimpan template pesan

    // Variabel untuk status sorting
    let currentSortColumn = null;
    let currentSortDirection = 'asc'; // 'asc' or 'desc'

    // Referensi ke jendela WhatsApp yang terbuka
    let waWindow = null;

    // Admin credentials (hardcoded for client-side)
    // PENTING: Untuk aplikasi produksi, ini HARUS disimpan di backend dengan keamanan yang tepat.
    const SUPER_ADMIN_ID = 'MANDO';
    const SUPER_ADMIN_PASS = '060814';

    // Default PIN aplikasi
    let currentPin = localStorage.getItem('appPin') || '0608'; // Default PIN jika belum ada

    // =====================================================================
    // --- FUNGSI UTILITAS UNTUK MODAL KUSTOM (ALERT & CONFIRM) ---
    // =====================================================================

    /**
     * Menampilkan modal konfirmasi kustom.
     * @param {string} message Pesan yang akan ditampilkan.
     * @param {string} [title='Konfirmasi'] Judul modal.
     * @returns {Promise<boolean>} Resolves true jika OK, false jika Batal.
     */
    function showCustomConfirm(message, title = 'Konfirmasi') {
        return new Promise((resolve) => {
            customConfirmTitle.textContent = title;
            customConfirmMessage.textContent = message;
            customConfirmModal.classList.add('active'); // Tampilkan modal

            const onOk = () => {
                customConfirmModal.classList.remove('active');
                customConfirmOkBtn.removeEventListener('click', onOk);
                customConfirmCancelBtn.removeEventListener('click', onCancel);
                customConfirmCloseBtn.removeEventListener('click', onCancel);
                resolve(true);
            };

            const onCancel = () => {
                customConfirmModal.classList.remove('active');
                customConfirmOkBtn.removeEventListener('click', onOk);
                customConfirmCancelBtn.removeEventListener('click', onCancel);
                customConfirmCloseBtn.removeEventListener('click', onCancel);
                resolve(false);
            };

            customConfirmOkBtn.addEventListener('click', onOk);
            customConfirmCancelBtn.addEventListener('click', onCancel);
            customConfirmCloseBtn.addEventListener('click', onCancel);
            // Tambahkan event listener untuk klik di luar modal
            customConfirmModal.addEventListener('click', function(e) {
                if (e.target === customConfirmModal) {
                    onCancel();
                }
            });
        });
    }

    /**
     * Menampilkan modal notifikasi kustom.
     * @param {string} message Pesan yang akan ditampilkan.
     * @param {string} [title='Notifikasi'] Judul modal.
     */
    function showCustomAlert(message, title = 'Notifikasi') {
        customAlertTitle.textContent = title;
        customAlertMessage.textContent = message;
        customAlertModal.classList.add('active'); // Tampilkan modal

        const onOk = () => {
            customAlertModal.classList.remove('active');
            customAlertOkBtn.removeEventListener('click', onOk);
            customAlertCloseBtn.removeEventListener('click', onOk);
        };

        customAlertOkBtn.addEventListener('click', onOk);
        customAlertCloseBtn.addEventListener('click', onOk);
        // Tambahkan event listener untuk klik di luar modal
        customAlertModal.addEventListener('click', function(e) {
            if (e.target === customAlertModal) {
                onOk();
            }
        });
    }


    // =====================================================================
    // --- PENYIAPAN EVENT LISTENER UTAMA ---
    // =====================================================================

    tabelBody.addEventListener('click', function(e) {
        const button = e.target.closest('.btn');
        const row = e.target.closest('tr');

        // Handle untuk mobile view (jika td di-tap)
        if (row && window.innerWidth < 767 && e.target.tagName === 'TD' && !e.target.closest('.aksi-container')) {
             const pelangganName = row.querySelector('td[data-label="Pelanggan"]').textContent;
             bukaModalDetailPelanggan(pelangganName); // Panggil modal detail dengan nama pelanggan
             return;
        }

        if (button) {
            const pelanggan = button.dataset.pelanggan;

            if (button.classList.contains('btn-wa')) {
                const kategori = button.dataset.kategori;
                kirimPesanWA(pelanggan, kategori);
            } else if (button.classList.contains('btn-lunas')) {
                bukaModalLunas(pelanggan);
            } else if (button.classList.contains('btn-detail')) {
                bukaModalDetailPelanggan(pelanggan);
            }
        }
    });

    // Event listener untuk menyimpan perubahan saat edit langsung di tabel detail pelanggan
    detailInvoiceList.addEventListener('focusout', async function(e) {
        const target = e.target;
        // Hanya proses jika elemen yang diedit dan nilainya berubah
        if (target.hasAttribute('contenteditable') && target.dataset.originalValue !== target.textContent) {
            const noInvoice = target.closest('tr').dataset.invoice;
            const field = target.dataset.field;
            let newValue = target.textContent.trim();

            const originalValue = target.dataset.originalValue;

            try {
                // Validasi input
                if (field.includes('tagihan')) { // Untuk 'sisa tagihan'
                    // Hapus semua karakter non-digit kecuali koma/titik, lalu ganti koma dengan titik untuk parseFloat
                    newValue = parseFloat(newValue.replace(/[^0-9,.]/g, '').replace(',', '.'));
                    if (isNaN(newValue)) {
                        await showCustomAlert("Input Sisa Tagihan harus berupa angka yang valid.", "Error Validasi");
                        target.textContent = originalValue; // Kembalikan ke nilai asli
                        return;
                    }
                } else if (field.includes('tanggal') || field.includes('jatuh tempo')) { // Untuk tanggal
                    const parsedDate = parseDateString(newValue);
                    if (isNaN(parsedDate.getTime())) {
                        await showCustomAlert("Input Tanggal harus dalam format DD-MM-YYYY.", "Error Validasi");
                        target.textContent = originalValue; // Kembalikan ke nilai asli
                        return;
                    }
                    newValue = parsedDate; // Simpan sebagai objek Date
                }

                const confirmEdit = await showCustomConfirm(`Apakah Anda yakin ingin mengubah '${field}' untuk invoice '${noInvoice}' menjadi '${newValue instanceof Date ? formatDate(newValue) : newValue}'?`);

                if (confirmEdit) {
                    const invoiceIndex = dataMaster.findIndex(item => item['no invoice'] === noInvoice);
                    if (invoiceIndex !== -1) {
                        dataMaster[invoiceIndex][field] = newValue;
                        // Normalisasi kembali kategori jika tanggal berubah
                        if (field === 'tanggal' || field === 'jatuh tempo') {
                            dataMaster[invoiceIndex].kategori = classifyCategory(dataMaster[invoiceIndex].tanggal, dataMaster[invoiceIndex]['jatuh tempo']);
                        }
                        localStorage.setItem('dataTagihanTerakhir', JSON.stringify(dataMaster));
                        await showCustomAlert("Data berhasil diperbarui!", "Sukses");
                        filterData(); // Refresh tampilan tabel utama
                        // Perbarui data-original-value agar tidak diminta konfirmasi lagi jika tidak ada perubahan
                        target.dataset.originalValue = target.textContent;
                    }
                } else {
                    target.textContent = originalValue; // Kembalikan ke nilai asli jika dibatalkan
                }
            } catch (error) {
                console.error("Error saat mengedit data:", error);
                await showCustomAlert("Terjadi kesalahan saat menyimpan perubahan. Mohon coba lagi.", "Error");
                target.textContent = originalValue; // Kembalikan ke nilai asli
            }
        }
    });

    // Event Listeners untuk unggah file dan bersihkan data
    fileInputMaster.addEventListener('change', handleFileMaster);
    fileInputDetail.addEventListener('change', handleFileDetail);

    clearDataMasterBtn.addEventListener('click', bersihkanDataMaster);
    clearDataDetailBtn.addEventListener('click', bersihkanDataDetail);


    filterCabang.addEventListener('change', filterData);
    filterKategori.addEventListener('change', filterData);
    cariPelanggan.addEventListener('input', filterData);

    // Event listener untuk sorting
    headerJatuhTempo.addEventListener('click', () => sortTable('jatuh tempo'));
    headerPelanggan.addEventListener('click', () => sortTable('pelanggan'));

    prosesLunasBtn.addEventListener('click', () => {
        const pelangganAktif = lunasModal.dataset.currentPelanggan;
        if (pelangganAktif) {
            prosesPembayaran(pelangganAktif);
        }
    });
    closeModalBtn.addEventListener('click', () => lunasModal.classList.remove('active'));
    lunasModal.addEventListener('click', (e) => {
        if (e.target === lunasModal) lunasModal.classList.remove('active');
    });

    // Event listener untuk menutup modal detail pelanggan
    detailModalCloseBtns.forEach(btn => {
        btn.addEventListener('click', () => detailPelangganModal.classList.remove('active'));
    });
    detailPelangganModal.addEventListener('click', (e) => {
        if (e.target === detailPelangganModal) detailPelangganModal.classList.remove('active');
    });

    // Event listener untuk mode gelap
    darkModeToggle.addEventListener('click', toggleDarkMode);

    // Event listener untuk modal template
    templateModalBtn.addEventListener('click', bukaModalTemplate);
    templateModalCloseBtn.addEventListener('click', () => templateModal.classList.remove('active'));
    templateModal.addEventListener('click', (e) => {
        if (e.target === templateModal) templateModal.classList.remove('active');
    });
    saveTemplateBtn.addEventListener('click', simpanTemplate);
    newTemplateBtn.addEventListener('click', () => {
        templateNameInput.value = '';
        templateContentInput.value = '';
        templateNameInput.focus();
    });
    savedTemplatesList.addEventListener('click', (e) => {
        const target = e.target;
        if (target.classList.contains('edit-template-btn')) {
            const templateName = target.dataset.templateName;
            editTemplate(templateName);
        } else if (target.classList.contains('delete-template-btn')) {
            const templateName = target.dataset.templateName;
            deleteTemplate(templateName);
        }
    });

    // =====================================================================
    // --- EVENT LISTENERS BARU UNTUK PIN & ADMIN ---
    // =====================================================================
    enterPinBtn.addEventListener('click', validatePinAccess);
    pinInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') validatePinAccess();
    });

    if (openAdminSettingsBtn) {
        openAdminSettingsBtn.addEventListener('click', showAdminLoginModal);
    }

    adminLoginBtn.addEventListener('click', authenticateAdmin);
    adminIdInput.addEventListener('keypress', function(e) { if (e.key === 'Enter') adminPasswordInput.focus(); });
    adminPasswordInput.addEventListener('keypress', function(e) { if (e.key === 'Enter') authenticateAdmin(); });

    modalCloseAdmin.addEventListener('click', () => adminLoginModal.classList.remove('active'));
    adminLoginModal.addEventListener('click', (e) => {
        if (e.target === adminLoginModal) adminLoginModal.classList.remove('active');
    });


    changePinBtn.addEventListener('click', changeApplicationPin);
    newPinInput.addEventListener('keypress', function(e) { if (e.key === 'Enter') confirmNewPinInput.focus(); });
    confirmNewPinInput.addEventListener('keypress', function(e) { if (e.key === 'Enter') changeApplicationPin(); });

    modalCloseChangePin.addEventListener('click', () => changePinModal.classList.remove('active'));
    changePinModal.addEventListener('click', (e) => {
        if (e.target === changePinModal) changePinModal.classList.remove('active');
    });


    // =====================================================================
    // --- FUNGSI UTAMA & ALUR APLIKASI ---
    // =====================================================================

    // Fungsi ini sekarang yang akan memuat data dan mengatur UI utama
    function loadAndSetupAppData() {
        // Muat data master tagihan
        const dataMasterTersimpan = localStorage.getItem('dataTagihanTerakhir');
        if (dataMasterTersimpan) {
            try {
                const dataJson = JSON.parse(dataMasterTersimpan);
                if (Array.isArray(dataJson) && dataJson.length > 0) {
                    // Pastikan objek Date di-rehidrasi dengan benar
                    const rehydratedData = dataJson.map(item => ({
                        ...item,
                        tanggal: new Date(item.tanggal),
                        'jatuh tempo': new Date(item['jatuh tempo'])
                    }));
                    prosesDataMaster(rehydratedData, false); // Jangan simpan lagi, hanya proses
                    uploadMasterText.textContent = 'File data_master.xlsx dimuat.';
                }
            } catch (error) {
                console.error("Gagal mem-parsing data master dari localStorage:", error);
                localStorage.removeItem('dataTagihanTerakhir'); // Hapus data rusak
                tabelBody.innerHTML = '<tr><td colspan="6" class="py-4 px-4 text-center text-gray-500">Silakan pilih file Excel di atas.</td></tr>';
                filterControls.style.display = 'none'; // Sembunyikan kontrol filter jika tidak ada data
            }
        } else {
            tabelBody.innerHTML = '<tr><td colspan="6" class="py-4 px-4 text-center text-gray-500">Silakan pilih file Excel di atas.</td></tr>';
            filterControls.style.display = 'none'; // Sembunyikan kontrol filter jika tidak ada data
            uploadMasterText.textContent = 'Pilih file data_master.xlsx';
        }

        // Muat data detail barang
        const dataDetailTersimpan = localStorage.getItem('dataDetailBarangTerakhir');
        if (dataDetailTersimpan) {
            try {
                const detailJson = JSON.parse(dataDetailTersimpan);
                if (typeof detailJson === 'object' && Object.keys(detailJson).length > 0) {
                    dataDetailBarang = detailJson;
                    uploadDetailText.textContent = 'File data_detail_barang.xlsx dimuat.';
                    console.log("Data Detail Barang Dimuat:", dataDetailBarang); // Debug log
                }
            } catch (error) {
                console.error("Gagal mem-parsing data detail barang dari localStorage:", error);
                localStorage.removeItem('dataDetailBarangTerakhir'); // Hapus data rusak
                uploadDetailText.textContent = 'Pilih file data_detail_barang.xlsx';
            }
        } else {
            uploadDetailText.textContent = 'Pilih file data_detail_barang.xlsx';
        }

        loadTemplates(); // Tetap muat template
        updateDarkModeFromLocalStorage(); // Muat preferensi mode gelap
        updateBadges(); // Perbarui badge saat aplikasi dimulai (mungkin kosong)
    }

    // Fungsi untuk handle file master tagihan
    function handleFileMaster(e) {
        const file = e.target.files[0];
        if (!file) return;

        loadingIndicatorMaster.classList.remove('hidden'); // Tampilkan indikator loading
        uploadMasterText.textContent = 'Memproses...';

        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, { type: 'array', cellDates: true, cellNF: false, cellText: false });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false, dateNF: 'yyyy-mm-dd' });

                const headers = jsonData[0];
                const actualData = jsonData.slice(1).map(row => {
                    const obj = {};
                    headers.forEach((header, index) => {
                        obj[header] = row[index];
                    });
                    return obj;
                });

                if (actualData.length === 0) {
                    showCustomAlert("File Excel data master kosong atau format tidak dapat dibaca.", "Gagal Memproses");
                    uploadMasterText.textContent = 'Pilih file data_master.xlsx';
                    return;
                }
                prosesDataMaster(actualData, true);
                uploadMasterText.textContent = 'File data_master.xlsx berhasil diunggah.';

            } catch (error) {
                console.error("Terjadi kesalahan saat memproses file Excel data master:", error);
                showCustomAlert("Gagal memproses file Excel data master. Pastikan format file benar dan coba lagi.", "Error");
                uploadMasterText.textContent = 'Pilih file data_master.xlsx';
            } finally {
                loadingIndicatorMaster.classList.add('hidden'); // Sembunyikan indikator loading
            }
        };
        reader.onerror = function() {
            showCustomAlert("Tidak dapat membaca file data master. Silakan coba lagi.", "Error Membaca File");
            loadingIndicatorMaster.classList.add('hidden'); // Sembunyikan indikator loading
            uploadMasterText.textContent = 'Pilih file data_master.xlsx';
        };
        reader.readAsArrayBuffer(file);
    }

    // Fungsi untuk handle file detail barang
    function handleFileDetail(e) {
        const file = e.target.files[0];
        if (!file) return;

        loadingIndicatorDetail.classList.remove('hidden'); // Tampilkan indikator loading
        uploadDetailText.textContent = 'Memproses...';

        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, { type: 'array' }); // Raw: false tidak diperlukan untuk teks
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                const headers = jsonData[0];
                const actualData = jsonData.slice(1).map(row => {
                    const obj = {};
                    headers.forEach((header, index) => {
                        obj[header] = row[index];
                    });
                    return obj;
                });

                if (actualData.length === 0) {
                    showCustomAlert("File Excel data detail barang kosong atau format tidak dapat dibaca.", "Gagal Memproses");
                    uploadDetailText.textContent = 'Pilih file data_detail_barang.xlsx';
                    return;
                }
                prosesDataDetailBarang(actualData, true);
                uploadDetailText.textContent = 'File data_detail_barang.xlsx berhasil diunggah.';

            } catch (error) {
                console.error("Terjadi kesalahan saat memproses file Excel data detail barang:", error);
                showCustomAlert("Gagal memproses file Excel data detail barang. Pastikan format file benar dan coba lagi.", "Error");
                uploadDetailText.textContent = 'Pilih file data_detail_barang.xlsx';
            } finally {
                loadingIndicatorDetail.classList.add('hidden'); // Sembunyikan indikator loading
            }
        };
        reader.onerror = function() {
            showCustomAlert("Tidak dapat membaca file data detail barang. Silakan coba lagi.", "Error Membaca File");
            loadingIndicatorDetail.classList.add('hidden'); // Sembunyikan indikator loading
            uploadDetailText.textContent = 'Pilih file data_detail_barang.xlsx';
        };
        reader.readAsArrayBuffer(file);
    }


    function prosesDataMaster(data, simpanKeLocalStorage) {
        try {
            dataMaster = data.map(item => {
                const requiredColumns = ['tanggal', 'jatuh tempo', 'pelanggan', 'sisa tagihan', 'no invoice', 'cabang', 'no wa'];
                const missingColumns = requiredColumns.filter(col => item[col] === undefined || item[col] === null);

                if (missingColumns.length > 0) {
                    console.warn(`Data dengan No Invoice '${item['no invoice'] || 'N/A'}' dilewati karena kolom yang hilang: ${missingColumns.join(', ')}.`);
                    return null;
                }

                let tanggal = item.tanggal instanceof Date ? item.tanggal : new Date(item.tanggal);
                let jatuhTempo = item['jatuh tempo'] instanceof Date ? item['jatuh tempo'] : new Date(item['jatuh tempo']);

                if (isNaN(tanggal.getTime()) || isNaN(jatuhTempo.getTime())) {
                    console.warn(`Data dengan No Invoice '${item['no invoice']}' memiliki format tanggal yang salah dan dilewati.`);
                    return null;
                }

                let sisaTagihanNumerik = parseFloat(item['sisa tagihan']);
                if (isNaN(sisaTagihanNumerik)) {
                    console.warn(`Data dengan No Invoice '${item['no invoice']}' memiliki 'sisa tagihan' yang bukan angka dan dilewati.`);
                    return null;
                }

                const normalizedNoWA = normalizePhoneNumber(item['no wa']);
                const kategori = classifyCategory(tanggal, jatuhTempo);

                return { ...item, tanggal, 'jatuh tempo': jatuhTempo, 'sisa tagihan': sisaTagihanNumerik, kategori, 'no wa': normalizedNoWA };
            }).filter(item => item !== null);

            if (dataMaster.length === 0) {
                showCustomAlert("Tidak ada data valid yang dapat diproses dari file data master.", "Informasi");
                tabelBody.innerHTML = '<tr><td colspan="6" class="py-4 px-4 text-center text-gray-500">Silakan pilih file Excel di atas.</td></tr>';
                filterControls.style.display = 'none';
                return;
            }

            if (simpanKeLocalStorage) {
                try {
                    localStorage.setItem('dataTagihanTerakhir', JSON.stringify(dataMaster));
                } catch (error) {
                    console.error("Gagal menyimpan data master ke localStorage:", error);
                    showCustomAlert("Peringatan: Gagal menyimpan data master untuk sesi berikutnya.", "Peringatan");
                }
            }

            filterControls.style.display = 'flex';
            populateFilterCabang();
            filterData();
            updateBadges(); // Perbarui badge setelah data dimuat

        } catch (error) {
            console.error("Error pada saat memproses klasifikasi data master:", error);
            showCustomAlert("Terjadi kesalahan saat mengolah data master. Periksa kolom-kolom di file Excel Anda.", "Error");
        }
    }

    function prosesDataDetailBarang(data, simpanKeLocalStorage) {
        dataDetailBarang = {}; // Reset data detail barang
        const requiredColumns = ['no invoice', 'kuantiti', 'nama barang'];
        let hasValidData = false;

        data.forEach(item => {
            const missingColumns = requiredColumns.filter(col => item[col] === undefined || item[col] === null);

            if (missingColumns.length > 0) {
                console.warn(`Data detail barang dengan No Invoice '${item['no invoice'] || 'N/A'}' dilewati karena kolom yang hilang: ${missingColumns.join(', ')}.`);
                return;
            }

            const noInvoice = String(item['no invoice']).trim();
            const kuantiti = parseFloat(item['kuantiti']);
            const namaBarang = String(item['nama barang']).trim();

            if (!noInvoice || isNaN(kuantiti) || kuantiti <= 0 || !namaBarang) {
                console.warn(`Data detail barang dengan No Invoice '${noInvoice}' dilewati karena nilai tidak valid.`);
                return;
            }

            if (!dataDetailBarang[noInvoice]) {
                dataDetailBarang[noInvoice] = [];
            }
            dataDetailBarang[noInvoice].push({
                kuantiti: kuantiti,
                nama_barang: namaBarang
            });
            hasValidData = true;
        });

        if (simpanKeLocalStorage && hasValidData) {
            try {
                localStorage.setItem('dataDetailBarangTerakhir', JSON.stringify(dataDetailBarang));
                console.log("Data Detail Barang Disimpan:", dataDetailBarang); // Debug log
            }
             catch (error) {
                console.error("Gagal menyimpan data detail barang ke localStorage:", error);
                showCustomAlert("Peringatan: Gagal menyimpan data detail barang untuk sesi berikutnya.", "Peringatan");
            }
        } else if (!hasValidData) {
            showCustomAlert("Tidak ada data detail barang valid yang dapat diproses dari file.", "Informasi");
        }
    }


    function classifyCategory(tanggalInvoice, jatuhTempoInvoice) {
        let kategori = 'Belum Jatuh Tempo';
        const hariIni = new Date();
        hariIni.setHours(0, 0, 0, 0); // Reset waktu untuk perbandingan tanggal saja

        // Konversi tanggal menjadi objek Date jika belum
        const tanggal = new Date(tanggalInvoice);
        const jatuhTempo = new Date(jatuhTempoInvoice);

        // Pastikan tanggal dan jatuhTempo adalah tanggal yang valid sebelum perhitungan
        if (isNaN(tanggal.getTime()) || isNaN(jatuhTempo.getTime())) {
            return 'Tidak Valid'; // Atau kategori default lain jika tanggal tidak valid
        }

        const tujuhHariSetelahTanggal = new Date(tanggal);
        tujuhHariSetelahTanggal.setDate(tanggal.getDate() + 7);
        tujuhHariSetelahTanggal.setHours(0, 0, 0, 0);

        const tigaHariSebelumJatuhTempo = new Date(jatuhTempo);
        tigaHariSebelumJatuhTempo.setDate(jatuhTempo.getDate() - 3);
        tigaHariSebelumJatuhTempo.setHours(0, 0, 0, 0);

        if (hariIni.getTime() >= jatuhTempo.getTime()) {
            kategori = 'Jatuh Tempo';
        } else if (hariIni.getTime() >= tigaHariSebelumJatuhTempo.getTime() && hariIni.getTime() < jatuhTempo.getTime()) {
            kategori = 'Akan Jatuh Tempo';
        } else if (hariIni.getTime() <= tujuhHariSetelahTanggal.getTime() && hariIni.getTime() >= tanggal.getTime()) { // Pastikan setelah tanggal invoice
            kategori = 'Konfirmasi Terima Barang';
        }
        return kategori;
    }


    function filterData() {
        const cabang = filterCabang.value;
        const kategori = filterKategori.value;
        const searchTerm = cariPelanggan.value.toLowerCase();

        let filteredData = dataMaster.filter(item => {
            const matchCabang = (cabang === 'semua') || (item.cabang === cabang);
            const matchKategori = (kategori === 'semua') || (item.kategori === kategori);
            const matchPelanggan = item.pelanggan.toLowerCase().includes(searchTerm);
            return matchCabang && matchKategori && matchPelanggan;
        });

        // Apply sorting after filtering
        if (currentSortColumn) {
            filteredData.sort((a, b) => {
                let valA, valB;
                if (currentSortColumn === 'jatuh tempo') {
                    valA = a['jatuh tempo'].getTime();
                    valB = b['jatuh tempo'].getTime();
                } else if (currentSortColumn === 'pelanggan') {
                    valA = a.pelanggan.toLowerCase();
                    valB = b.pelanggan.toLowerCase();
                }

                if (valA < valB) return currentSortDirection === 'asc' ? -1 : 1;
                if (valA > valB) return currentSortDirection === 'asc' ? 1 : -1;
                return 0;
            });
        }


        tampilkanData(filteredData);
        updateBadges(); // Perbarui badge setiap kali filterData dipanggil
    }

    function tampilkanData(data) {
        tabelBody.innerHTML = '';
        if (data.length === 0) {
            tabelBody.innerHTML = '<tr><td colspan="6" class="py-4 px-4 text-center text-gray-500">Tidak ada data yang sesuai.</td></tr>';
            return;
        }

        // Hapus ikon sorting yang lama dari semua header
        document.querySelectorAll('#tabel-tagihan thead th .sort-icon').forEach(icon => icon.remove());

        // Tambahkan ikon sorting ke header yang aktif
        const addSortIcon = (headerElement, direction) => {
            const icon = document.createElement('i');
            icon.classList.add('sort-icon', 'ml-2', 'fas');
            if (direction === 'asc') {
                icon.classList.add('fa-sort-up');
            } else {
                icon.classList.add('fa-sort-down');
            }
            headerElement.appendChild(icon);
        };

        if (currentSortColumn === 'jatuh tempo') {
            addSortIcon(headerJatuhTempo, currentSortDirection);
        } else if (currentSortColumn === 'pelanggan') {
            addSortIcon(headerPelanggan, currentSortDirection);
        }


        data.forEach(item => {
            const row = document.createElement('tr');
            // Menambahkan data-label untuk responsif mobile
            row.innerHTML = `
                <td data-label="No Invoice" class="py-3 px-4">${item['no invoice']}</td>
                <td data-label="Tanggal" class="py-3 px-4">${formatDate(item.tanggal)}</td>
                <td data-label="Jatuh Tempo" class="py-3 px-4">${formatDate(item['jatuh tempo'])}</td>
                <td data-label="Pelanggan" class="py-3 px-4">${item.pelanggan}</td>
                <td data-label="Sisa Tagihan" class="py-3 px-4">${formatRupiah(item['sisa tagihan'])}</td>
                <td data-label="Aksi" class="py-3 px-4 aksi-container">
                    <button class="btn btn-wa" data-pelanggan="${item.pelanggan}" data-kategori="${item.kategori}">
                        <i class="fab fa-whatsapp"></i> Kirim Pesan
                    </button>
                    <button class="btn btn-lunas" data-pelanggan="${item.pelanggan}">
                        <i class="fas fa-check-circle"></i> Lunas
                    </button>
                    <button class="btn btn-detail" data-pelanggan="${item.pelanggan}">
                        <i class="fas fa-info-circle"></i> Detail
                    </button>
                </td>
            `;
            tabelBody.appendChild(row);
        });
    }

    // Fungsi Sorting Tabel
    function sortTable(column) {
        if (currentSortColumn === column) {
            currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            currentSortColumn = column;
            currentSortDirection = 'asc';
        }
        filterData(); // Panggil filterData untuk mengurutkan dan menampilkan ulang
    }


    function updateBadges() {
        const countAkanJatuhTempo = dataMaster.filter(item => item.kategori === 'Akan Jatuh Tempo').length;
        const countJatuhTempo = dataMaster.filter(item => item.kategori === 'Jatuh Tempo').length;
        const countKonfirmasiTerimaBarang = dataMaster.filter(item => item.kategori === 'Konfirmasi Terima Barang').length;


        badgeAkanJatuhTempo.textContent = countAkanJatuhTempo > 0 ? countAkanJatuhTempo : '';
        badgeJatuhTempo.textContent = countJatuhTempo > 0 ? countJatuhTempo : '';
        badgeKonfirmasiTerimaBarang.textContent = countKonfirmasiTerimaBarang > 0 ? countKonfirmasiTerimaBarang : '';


        // Tampilkan/sembunyikan badge berdasarkan jumlah
        badgeAkanJatuhTempo.style.display = countAkanJatuhTempo > 0 ? 'inline-block' : 'none';
        badgeJatuhTempo.style.display = countJatuhTempo > 0 ? 'inline-block' : 'none';
        badgeKonfirmasiTerimaBarang.style.display = countKonfirmasiTerimaBarang > 0 ? 'inline-block' : 'none';
    }


    function bukaModalLunas(namaPelanggan) {
        modalTitle.textContent = `Pilih Invoice Lunas: ${namaPelanggan}`;
        modalInvoiceList.innerHTML = '';
        lunasModal.dataset.currentPelanggan = namaPelanggan;
        const tagihanPelanggan = dataMaster.filter(item => item.pelanggan === namaPelanggan);

        if (tagihanPelanggan.length === 0) {
            showCustomAlert('Tidak ada tagihan untuk pelanggan ini.', "Informasi");
            return;
        }

        tagihanPelanggan.forEach(item => {
            const invoiceDiv = document.createElement('div');
            invoiceDiv.className = 'invoice-item';
            invoiceDiv.innerHTML = `
                <input type="checkbox" data-invoice="${item['no invoice']}" class="form-checkbox h-5 w-5 text-blue-600 rounded">
                <div class="invoice-details flex-1">
                    <span class="pelanggan-info">${item['no invoice']} - ${formatDate(item['jatuh tempo'])}</span>
                    <span class="tagihan-info">${formatRupiah(item['sisa tagihan'])}</span>
                </div>
            `;
            modalInvoiceList.appendChild(invoiceDiv);
        });
        lunasModal.classList.add('active'); // Tampilkan modal
    }

    async function prosesPembayaran(namaPelanggan) {
        const checkboxes = modalInvoiceList.querySelectorAll('input[type="checkbox"]:checked');
        if (checkboxes.length === 0) {
            await showCustomAlert('Silakan pilih minimal satu invoice yang sudah dibayar.', "Peringatan");
            return;
        }

        const confirmProceed = await showCustomConfirm("Apakah Anda yakin ingin memproses pembayaran ini dan mengirim pesan WhatsApp?", "Konfirmasi Pembayaran");
        if (!confirmProceed) {
            return;
        }

        const invoiceLunasIds = Array.from(checkboxes).map(cb => cb.dataset.invoice);
        const pelangganData = dataMaster.find(item => item.pelanggan === namaPelanggan);

        if (!pelangganData || !pelangganData['no wa']) {
            await showCustomAlert('Nomor WhatsApp pelanggan tidak ditemukan.', "Error");
            return;
        }
        const noWA = pelangganData['no wa'];

        let totalDibayar = 0;
        const invoicesLunasDetail = [];
        dataMaster.forEach(item => {
            if (item.pelanggan === namaPelanggan && invoiceLunasIds.includes(item['no invoice'])) {
                totalDibayar += item['sisa tagihan'];
                invoicesLunasDetail.push(item);
            }
        });

        // Filter dataMaster secara global setelah mendapatkan semua invoice yang lunas
        dataMaster = dataMaster.filter(item => !(item.pelanggan === namaPelanggan && invoiceLunasIds.includes(item['no invoice'])));

        // Siapkan placeholder untuk template
        const placeholders = {
            '{{nama_pelanggan}}': namaPelanggan,
            '{{total_dibayar}}': formatRupiah(totalDibayar),
            '{{daftar_invoice_lunas}}': invoicesLunasDetail.map(item =>
                `- ${item['no invoice']} (Jatuh Tempo: ${formatDate(item['jatuh tempo'])}) - ${formatRupiah(item['sisa tagihan'])}`
            ).join('\n'),
        };

        let pesan = '';
        const templateLunas = templates['Pembayaran Lunas']; // Ambil template 'Pembayaran Lunas'

        let sisaTagihanInfo = '';
        // Hitung sisa tagihan yang benar setelah filter
        const remainingTagihan = dataMaster.filter(item => item.pelanggan === namaPelanggan);
        if (remainingTagihan.length > 0) {
            let totalSisaTagihan = 0;
            const sisaDetail = remainingTagihan.map(item => {
                totalSisaTagihan += item['sisa tagihan'];
                return `- ${item['no invoice']} | Jatuh Tempo: ${formatDate(item['jatuh tempo'])} | ${formatRupiah(item['sisa tagihan'])}`;
            }).join('\n');
            sisaTagihanInfo = `Berikut adalah sisa tagihan Anda yang masih harus diselesaikan:\n${sisaDetail}\n\nTotal Sisa Tagihan: ${formatRupiah(totalSisaTagihan)}`;
        } else {
            sisaTagihanInfo = 'Saat ini seluruh tagihan Anda sudah lunas. Terima kasih atas kerjasamanya.';
        }
        placeholders['{{sisa_tagihan_info}}'] = sisaTagihanInfo; // Tambahkan ke placeholder

        if (templateLunas) {
            pesan = applyTemplate(templateLunas, placeholders);
        } else {
            // Fallback jika template tidak ada
            pesan = `Yth. Bapak/Ibu ${namaPelanggan},\n\nTerima kasih atas pembayaran sebesar ${formatRupiah(totalDibayar)}. Pembayaran Anda telah kami terima.\n`;
            if (invoicesLunasDetail.length > 0) {
                pesan += `\nDetail Invoice Lunas:\n${placeholders['{{daftar_invoice_lunas}}']}`;
            }
            pesan += `\n\n${sisaTagihanInfo}`;
            pesan += '\n\nSalam hangat FORTRESS™.';
        }


        localStorage.setItem('dataTagihanTerakhir', JSON.stringify(dataMaster));
        lunasModal.classList.remove('active');
        filterData();
        updateBadges(); // Perbarui badge setelah pembaruan data

        const urlWA = `https://web.whatsapp.com/send?phone=${noWA}&text=${encodeURIComponent(pesan)}`;
        
        // Logic baru untuk membuka atau mengarahkan ke tab WhatsApp yang sudah ada
        if (waWindow && !waWindow.closed) {
            waWindow.location.href = urlWA;
            waWindow.focus();
        } else {
            waWindow = window.open(urlWA, 'whatsapp_tab'); // 'whatsapp_tab' adalah nama target
        }

        await showCustomAlert("Pesan WhatsApp berhasil disiapkan dan data telah diperbarui!", "Sukses");
    }

    async function kirimPesanWA(namaPelanggan, kategori) {
        const tagihanPelanggan = dataMaster.filter(item => item.pelanggan === namaPelanggan);
        if (tagihanPelanggan.length === 0) {
            await showCustomAlert('Tidak ada tagihan untuk pelanggan ini.', "Informasi");
            return;
        }

        const noWA = tagihanPelanggan[0]?.['no wa'];
        if (!noWA) {
            await showCustomAlert('Nomor WhatsApp pelanggan tidak ditemukan.', "Error");
            return;
        }

        const confirmSend = await showCustomConfirm(`Apakah Anda yakin ingin mengirim pesan WhatsApp ke ${namaPelanggan} (${noWA}) untuk kategori "${kategori}"?`, "Konfirmasi Pengiriman");
        if (!confirmSend) {
            return;
        }

        let totalTagihan = tagihanPelanggan.reduce((sum, item) => {
            const sisaTagihanNum = parseFloat(item['sisa tagihan']);
            return sum + (isNaN(sisaTagihanNum) ? 0 : sisaTagihanNum);
        }, 0);

        let daftarInvoiceFormatted = tagihanPelanggan.map(item => {
            const sisaTagihanNum = parseFloat(item['sisa tagihan']);
            const formattedSisaTagihan = isNaN(sisaTagihanNum) ? "Jumlah Tidak Valid" : formatRupiah(sisaTagihanNum);
            return `- ${item['no invoice']} (Jatuh Tempo: ${formatDate(item['jatuh tempo'])}) - ${formattedSisaTagihan}`;
        }).join('\n');

        let detailBarangKuantiti = '';
        if (kategori === 'Konfirmasi Terima Barang') {
            console.log("Processing 'Konfirmasi Terima Barang' category..."); // Debug log
            console.log("Current Item Details Data:", dataDetailBarang); // Debug log: Check itemDetails data content
            console.log("Customer Bills:", tagihanPelanggan); // Debug log

            const invoicesWithDetail = tagihanPelanggan.filter(item => {
                const hasDetail = dataDetailBarang.hasOwnProperty(String(item['no invoice']).trim());
                console.log(`Invoice ${item['no invoice']}: Has details? ${hasDetail}`); // Debug log
                return hasDetail;
            });

            if (invoicesWithDetail.length > 0) {
                detailBarangKuantiti += 'Berikut adalah detail barang untuk invoice terkait:\n';
                invoicesWithDetail.forEach(item => {
                    const invoiceNo = String(item['no invoice']).trim();
                    const details = dataDetailBarang[invoiceNo];
                    if (details && details.length > 0) { // Ensure detail array is not empty
                        details.forEach(detail => {
                            detailBarangKuantiti += `- Invoice ${invoiceNo}: ${detail.kuantiti}x ${detail.nama_barang}\n`;
                        });
                    }
                });
            } else {
                detailBarangKuantiti = '(Tidak ada detail barang tersedia untuk invoice ini.)\n';
            }
            console.log('Generated detailBarangKuantiti:', detailBarangKuantiti); // Debug log
        }


        let pesan = '';
        let templateKey = '';

        // Determine template based on category
        if (kategori === 'Konfirmasi Terima Barang') {
            templateKey = 'Konfirmasi Terima Barang';
        } else if (kategori === 'Akan Jatuh Tempo') {
            templateKey = 'Akan Jatuh Tempo';
        } else if (kategori === 'Jatuh Tempo') {
            templateKey = 'Jatuh Tempo';
        } else {
            templateKey = 'Default'; // Default template if no category matches
        }

        const selectedTemplate = templates[templateKey];

        if (selectedTemplate) {
            const placeholders = {
                '{{nama_pelanggan}}': namaPelanggan,
                '{{daftar_invoice}}': daftarInvoiceFormatted,
                '{{total_tagihan}}': formatRupiah(totalTagihan),
                '{{detail_barang_kuantiti}}': detailBarangKuantiti, // New placeholder
                '{{sisa_tagihan_detail}}': '', // Empty for this template
                '{{total_sisa_tagihan}}': '' // Empty for this template
            };
            pesan = applyTemplate(selectedTemplate, placeholders);
        } else {
            // Fallback if template not found
            const headerPesan = `Yth. Bapak/Ibu ${namaPelanggan},\n\n`;
            const footerPesan = `\n\nTotal Tagihan: ${formatRupiah(totalTagihan)}\n\nSalam hangat FORTRESS™.`;
            switch (kategori) {
                case 'Konfirmasi Terima Barang':
                    pesan = `${headerPesan}Kami ingin mengkonfirmasi apakah barang untuk tagihan berikut sudah diterima dengan baik?${daftarInvoiceFormatted}\n${detailBarangKuantiti}${footerPesan}`;
                    break;
                case 'Akan Jatuh Tempo':
                    pesan = `${headerPesan}Kami informasikan bahwa tagihan Anda akan segera jatuh tempo. Berikut rinciannya:${daftarInvoiceFormatted}\n\nMohon untuk dapat segera dilakukan pembayaran.${footerPesan}`;
                    break;
                case 'Jatuh Tempo':
                    pesan = `${headerPesan}Menurut catatan kami, tagihan berikut telah melewati tanggal jatuh tempo. Berikut rinciannya:${daftarInvoiceFormatted}\n\nKami mohon untuk segera melakukan pembayaran.${footerPesan}`;
                    break;
                default:
                    pesan = `${headerPesan}Berikut adalah rincian tagihan Anda:${daftarInvoiceFormatted}${footerPesan}`;
                    break;
            }
        }

        const urlWA = `https://web.whatsapp.com/send?phone=${noWA}&text=${encodeURIComponent(pesan)}`;
        
        // Logic baru untuk membuka atau mengarahkan ke tab WhatsApp yang sudah ada
        if (waWindow && !waWindow.closed) {
            waWindow.location.href = urlWA;
            waWindow.focus();
        } else {
            waWindow = window.open(urlWA, 'whatsapp_tab'); // 'whatsapp_tab' adalah nama target
        }
        
        await showCustomAlert("WhatsApp message prepared successfully!", "Success");
    }

    function bukaModalDetailPelanggan(namaPelanggan) {
        // Filter dataMaster to get all invoices for the selected customer
        const tagihanPelanggan = dataMaster.filter(item => item.pelanggan === namaPelanggan);

        if (tagihanPelanggan.length === 0) {
            showCustomAlert('Tidak ada tagihan untuk pelanggan ini.', "Informasi");
            return;
        }

        // Get the first customer data for contact info
        const pelangganInfo = tagihanPelanggan[0];
        detailModalTitle.textContent = `Detail Pelanggan: ${namaPelanggan}`;
        detailNamaPelanggan.textContent = pelangganInfo.pelanggan;
        detailCabangPelanggan.textContent = pelangganInfo.cabang;
        detailNoWaPelanggan.textContent = pelangganInfo['no wa'];

        detailInvoiceList.innerHTML = ''; // Clear previous invoice list

        tagihanPelanggan.forEach(item => {
            const row = document.createElement('tr');
            // Add data-invoice for identification when editing
            row.dataset.invoice = item['no invoice'];
            row.innerHTML = `
                <td class="py-2 px-3" contenteditable="true" data-field="no invoice" data-original-value="${item['no invoice']}">${item['no invoice']}</td>
                <td class="py-2 px-3" contenteditable="true" data-field="tanggal" data-original-value="${formatDate(item.tanggal)}">${formatDate(item.tanggal)}</td>
                <td class="py-2 px-3" contenteditable="true" data-field="jatuh tempo" data-original-value="${formatDate(item['jatuh tempo'])}">${formatDate(item['jatuh tempo'])}</td>
                <td class="py-2 px-3" contenteditable="true" data-field="sisa tagihan" data-original-value="${item['sisa tagihan']}">${formatRupiah(item['sisa tagihan'])}</td>
                <td class="py-2 px-3">${item.kategori}</td>
            `;
            detailInvoiceList.appendChild(row);
        });

        detailPelangganModal.classList.add('active'); // Show modal
    }


    function populateFilterCabang() {
        const cabangUnik = [...new Set(dataMaster.map(item => item.cabang))];
        filterCabang.innerHTML = '<option value="semua">Semua Cabang</option>';
        cabangUnik.forEach(cabang => {
            const option = document.createElement('option');
            option.value = cabang;
            option.textContent = cabang;
            filterCabang.appendChild(option);
        });
    }

    function formatRupiah(angka) {
        const num = parseFloat(angka);
        if (isNaN(num)) {
            return "Rp0";
        }
        // Using Intl.NumberFormat with minimumFractionDigits: 0 option
        // so it doesn't show decimals if the number is an integer.
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2 // Max 2 decimals if any
        }).format(num);
    }

    function formatDate(dateObject) {
        if (!dateObject) return '';
        const date = new Date(dateObject);
        // Ensure date is valid
        if (isNaN(date.getTime())) {
            return 'Tanggal Tidak Valid';
        }
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }

    // Function to parse DD-MM-YYYY date string into a Date object
    function parseDateString(dateString) {
        const parts = dateString.split('-');
        if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1; // Month is 0-based
            const year = parseInt(parts[2], 10);
            // Caution: new Date(year, month, day) can produce unexpected dates
            // if day/month are invalid. Ensure correct parsing.
            const date = new Date(year, month, day);
            // Additional validation: ensure the created date matches the input
            if (date.getFullYear() === year && date.getMonth() === month && date.getDate() === day) {
                return date;
            }
        }
        return new Date('Invalid Date'); // Return invalid date if format is wrong
    }

    function normalizePhoneNumber(phoneNumber) {
        if (!phoneNumber) return '';
        let cleaned = String(phoneNumber).replace(/\D/g, ''); // Remove all non-digit characters

        if (cleaned.startsWith('0')) {
            cleaned = '62' + cleaned.substring(1); // Replace '0' with '62'
        } else if (cleaned.startsWith('+')) {
            cleaned = cleaned.substring(1); // Remove '+'
        }

        // Ensure starts with '62'
        if (!cleaned.startsWith('62') && cleaned.length > 0) { // Add cleaned.length > 0 check
            cleaned = '62' + cleaned;
        }
        return cleaned;
    }

    async function bersihkanDataMaster() {
        const confirmed = await showCustomConfirm("Apakah Anda yakin ingin menghapus semua data tagihan? Tindakan ini tidak dapat dibatalkan.", "Konfirmasi Hapus Data Master");
        if (confirmed) {
            localStorage.removeItem('dataTagihanTerakhir');
            dataMaster = [];
            tabelBody.innerHTML = '<tr><td colspan="6" class="py-4 px-4 text-center text-gray-500">Silakan pilih file Excel di atas.</td></tr>';
            uploadMasterText.textContent = 'Pilih file data_master.xlsx';
            filterControls.style.display = 'none';
            filterCabang.innerHTML = '<option value="semua">Semua Cabang</option>';
            filterKategori.value = 'semua';
            cariPelanggan.value = '';
            updateBadges(); // Reset badges
            await showCustomAlert("Data tagihan berhasil dibersihkan.", "Sukses");
        }
    }

    async function bersihkanDataDetail() {
        const confirmed = await showCustomConfirm("Apakah Anda yakin ingin menghapus semua data detail barang? Tindakan ini tidak dapat dibatalkan.", "Konfirmasi Hapus Data Detail Barang");
        if (confirmed) {
            localStorage.removeItem('dataDetailBarangTerakhir');
            dataDetailBarang = {};
            uploadDetailText.textContent = 'Pilih file data_detail_barang.xlsx';
            await showCustomAlert("Data detail barang berhasil dibersihkan.", "Sukses");
        }
    }

    // =====================================================================
    // --- FUNGSI MODE GELAP ---
    // =====================================================================

    function toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        // Save dark mode preference to localStorage
        if (document.body.classList.contains('dark-mode')) {
            localStorage.setItem('theme', 'dark');
        } else {
            localStorage.setItem('theme', 'light');
        }
    }

    function updateDarkModeFromLocalStorage() {
        const theme = localStorage.getItem('theme');
        // Use prefers-color-scheme as fallback if not in localStorage
        if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }

    // =====================================================================
    // --- FUNGSI MANAJEMEN TEMPLATE PESAN ---
    // =====================================================================

    function loadTemplates() {
        const storedTemplates = localStorage.getItem('whatsappTemplates');
        if (storedTemplates) {
            templates = JSON.parse(storedTemplates);
        } else {
            // Set default templates if none exist
            templates = {
                "Default": "Yth. Bapak/Ibu {{nama_pelanggan}},\n\nBerikut adalah rincian tagihan Anda:\n{{daftar_invoice}}\n\nTotal Tagihan: {{total_tagihan}}\n\nTerima kasih. Salam hangat FORTRESS™.",
                "Konfirmasi Terima Barang": "Yth. Bapak/Ibu {{nama_pelanggan}},\n\nKami ingin mengkonfirmasi apakah barang untuk tagihan berikut sudah diterima dengan baik?\n{{daftar_invoice}}\n\n{{detail_barang_kuantiti}}\n\nTotal Tagihan: {{total_tagihan}}\n\nTerima kasih. Salam hangat FORTRESS™.",
                "Akan Jatuh Tempo": "Yth. Bapak/Ibu {{nama_pelanggan}},\n\nKami informasikan bahwa tagihan Anda akan segera jatuh tempo. Berikut rinciannya:\n{{daftar_invoice}}\n\nMohon untuk dapat segera dilakukan pembayaran.\n\nTotal Tagihan: {{total_tagihan}}\n\nTerima kasih. Salam hangat FORTRESS™.",
                "Jatuh Tempo": "Yth. Bapak/Ibu {{nama_pelanggan}},\n\nMenurut catatan kami, tagihan berikut telah melewati tanggal jatuh tempo. Berikut rinciannya:\n{{daftar_invoice}}\n\nKami mohon untuk segera melakukan pembayaran.\n\nTotal Tagihan: {{total_tagihan}}\n\nTerima kasih. Salam hangat FORTRESS™.",
                "Pembayaran Lunas": "Yth. Bapak/Ibu {{nama_pelanggan}},\n\nTerima kasih atas pembayaran sebesar {{total_dibayar}}. Pembayaran Anda telah kami terima.\n\nDetail Invoice Lunas:\n{{daftar_invoice_lunas}}\n\n{{sisa_tagihan_info}}\n\nSalam hangat FORTRESS™."
            };
        }
        renderSavedTemplates();
    }

    function saveTemplates() {
        localStorage.setItem('whatsappTemplates', JSON.stringify(templates));
    }

    function renderSavedTemplates() {
        savedTemplatesList.innerHTML = '';
        if (Object.keys(templates).length === 0) {
            savedTemplatesList.innerHTML = '<p class="text-center text-gray-500">Tidak ada template tersimpan.</p>';
            return;
        }
        for (const name in templates) {
            const templateItem = document.createElement('div');
            templateItem.className = 'flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0';
            templateItem.innerHTML = `
                <span class="font-medium flex-1">${name}</span>
                <div>
                    <button class="edit-template-btn text-white px-3 py-1 rounded-md text-sm mr-2" data-template-name="${name}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="delete-template-btn text-white px-3 py-1 rounded-md text-sm" data-template-name="${name}">
                        <i class="fas fa-trash"></i> Hapus
                    </button>
                </div>
            `;
            savedTemplatesList.appendChild(templateItem);
        }
    }

    async function simpanTemplate() {
        const name = templateNameInput.value.trim();
        const content = templateContentInput.value.trim();

        if (!name || !content) {
            await showCustomAlert('Nama dan konten template tidak boleh kosong.', "Peringatan");
            return;
        }

        if (templates[name] && templates[name] !== content) {
            const confirmOverwrite = await showCustomConfirm(`Template dengan nama "${name}" sudah ada. Timpa?`, "Konfirmasi Timpa Template");
            if (!confirmOverwrite) {
                return;
            }
        }

        templates[name] = content;
        saveTemplates();
        renderSavedTemplates();
        await showCustomAlert('Template berhasil disimpan!', "Sukses");
        templateNameInput.value = '';
        templateContentInput.value = '';
    }

    function editTemplate(name) {
        templateNameInput.value = name;
        templateContentInput.value = templates[name];
        templateNameInput.focus();
    }

    async function deleteTemplate(name) {
        const confirmed = await showCustomConfirm(`Apakah Anda yakin ingin menghapus template "${name}"?`, "Konfirmasi Hapus Template");
        if (confirmed) {
            delete templates[name];
            saveTemplates();
            renderSavedTemplates();
            await showCustomAlert('Template berhasil dihapus!', "Sukses");
            // Clear input fields if the deleted template was being edited
            if (templateNameInput.value === name) {
                templateNameInput.value = '';
                templateContentInput.value = '';
            }
        }
    }

    function bukaModalTemplate() {
        renderSavedTemplates(); // Ensure the latest template list is displayed
        templateModal.classList.add('active');
    }

    // Function to apply template with placeholders
    function applyTemplate(templateContent, placeholders) {
        let result = templateContent;
        for (const key in placeholders) {
            // Use regex to replace all instances of placeholder {{key}}
            result = result.replace(new RegExp(key, 'g'), placeholders[key]);
        }
        return result;
    }

    // =====================================================================
    // --- FUNGSI PIN AKSES DAN ADMIN ---
    // =====================================================================
    function showPinAccessModal() {
        pinAccessModal.classList.add('active');
        pinInput.value = '';
        pinErrorMessage.textContent = '';
        pinInput.focus();
    }

    async function validatePinAccess() {
        const enteredPin = pinInput.value;
        if (enteredPin === currentPin) {
            pinAccessModal.classList.remove('active');
            loadAndSetupAppData(); // Lanjutkan memuat aplikasi setelah PIN benar
        } else {
            pinErrorMessage.textContent = 'PIN salah. Coba lagi atau hubungi PAMAN.';
            pinInput.value = '';
            pinInput.focus();
        }
    }

    function showAdminLoginModal() {
        adminLoginModal.classList.add('active');
        adminIdInput.value = '';
        adminPasswordInput.value = '';
        adminErrorMessage.textContent = '';
        adminIdInput.focus();
    }

    async function authenticateAdmin() {
        const enteredId = adminIdInput.value;
        const enteredPass = adminPasswordInput.value;

        if (enteredId === SUPER_ADMIN_ID && enteredPass === SUPER_ADMIN_PASS) {
            adminLoginModal.classList.remove('active');
            showChangePinModal();
        } else {
            adminErrorMessage.textContent = 'ID Admin atau Password salah.';
            adminPasswordInput.value = '';
            adminPasswordInput.focus();
        }
    }

    function showChangePinModal() {
        changePinModal.classList.add('active');
        newPinInput.value = '';
        confirmNewPinInput.value = '';
        changePinErrorMessage.textContent = '';
        newPinInput.focus();
    }

    async function changeApplicationPin() {
        const newPin = newPinInput.value.trim();
        const confirmPin = confirmNewPinInput.value.trim();

        if (newPin.length === 0 || newPin.length > 4 || !/^\d{4}$/.test(newPin)) {
            changePinErrorMessage.textContent = 'PIN baru harus 4 digit angka.';
            return;
        }
        if (newPin !== confirmPin) {
            changePinErrorMessage.textContent = 'Konfirmasi PIN tidak cocok.';
            return;
        }

        currentPin = newPin;
        localStorage.setItem('appPin', currentPin);
        changePinModal.classList.remove('active');
        await showCustomAlert('PIN aplikasi berhasil diubah!', 'Sukses');
    }


    // Panggil showPinAccessModal saat aplikasi pertama kali dimuat
    showPinAccessModal();
});
