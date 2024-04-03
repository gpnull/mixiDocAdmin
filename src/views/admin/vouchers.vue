<template>
  <div>
    <v-data-table :headers="headers" :items="vouchers" :search="search" class="elevation-1" :loading="loading"
      loading-text="Loading... Please wait">
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>Voucher</v-toolbar-title>
          <v-divider class="mx-4" inset vertical />
          <v-spacer />

          <v-dialog v-model="dialog" max-width="500px">
            <template v-slot:activator="{ on, attrs }">
              <v-btn color="primary" dark class="mb-2" v-bind="attrs" v-on="on">Tạo</v-btn>
            </template>
            <v-card>
              <v-card-title>
                <span class="headline">{{ formTitle }}</span>
              </v-card-title>

              <v-card-text>
                <v-container>
                  <v-form v-bind:disabled="loading" lazy-validation ref="dialogForm">
                    <v-row>
                      <v-col cols="12" sm="12" md="12">
                        <v-text-field :disabled="loading" :rules="fieldRule" v-model="editedItem.name" label="Tên">
                        </v-text-field>
                      </v-col>
                      <v-col cols="4" sm="4" md="4">
                        <v-text-field :disabled="loading" :rules="fieldRule" v-model="editedItem.codePromotion"
                          label="Mã ưu đãi">
                        </v-text-field>
                      </v-col>
                      <v-col cols="3" sm="3" md="3">
                        <v-text-field :disabled="loading" :rules="fieldRule" v-model="editedItem.quantity" type="number"
                          label="Số lượng">
                        </v-text-field>
                      </v-col>
                      <v-col class="d-flex" cols="5" sm="5" md="5">
                        <v-select :items="doctorIds" :disabled="loading" :rules="fieldRule"
                          v-model="editedItem.doctorId" label="Mã xác thực"></v-select>
                      </v-col>
                      <v-col class="d-flex" cols="12" sm="12" md="12">
                        <v-select :items="contentPromotions" :disabled="loading" :rules="fieldRule"
                          v-model="editedItem.contentPromotion" label="Nội dung ưu đãi"></v-select>
                      </v-col>
                      <v-col cols="12" sm="12" md="12">
                        <v-text-field :disabled="loading" v-model="editedItem.timeUsed"
                          label="Thời gian xác thực lần cuối">
                        </v-text-field>
                      </v-col>
                      <v-col cols="12" sm="12" md="12">
                        <v-text-field :disabled="loading" v-model="editedItem.doctorUsed"
                          label="Bác sĩ xác thực lần cuối">
                        </v-text-field>
                      </v-col>
                    </v-row>
                  </v-form>
                </v-container>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn :disabled="loading" color="red darken-1" text @click="close">Hủy</v-btn>
                <v-btn :disabled="loading" color="blue darken-1" text @click="save">Lưu</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>

          <v-dialog v-model="voucherDialog" max-width="500px">
            <v-card>
              <v-card-title>
                <span class="headline">Xác thực mã</span>
              </v-card-title>

              <v-card-text>
                <v-container>
                  <v-form v-bind:disabled="loading" lazy-validation ref="voucherDialogForm">
                    <v-row>

                      <v-col cols="12" sm="12" md="12">
                        <v-text-field autofocus :disabled="loading" :rules="fieldRule"
                          v-model="editedItem.codeAuthentication" @keyup="uppercase"
                          label="Nhập mã xác thực (VD: PPP01111)">
                        </v-text-field>
                      </v-col>

                      <v-col cols="12" sm="12" md="12">
                        <v-text-field disabled v-model="editedItem.timeUsed" label="Thời gian xác thực lần cuối">
                        </v-text-field>
                      </v-col>
                      <v-col cols="12" sm="12" md="12">
                        <v-text-field disabled v-model="editedItem.doctorUsed" label="Bác sĩ xác thực lần cuối">
                        </v-text-field>
                      </v-col>

                    </v-row>
                  </v-form>
                </v-container>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn :disabled="loading" color="red darken-1" text @click="close">Hủy</v-btn>
                <v-btn :disabled="loading" color="blue darken-1" text @click="useVoucher">Sử dụng voucher</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>

          <v-btn v-if="isAdmin" text icon class="mb-2 ml-2" @click="deleteAll" color="error">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
          <!-- <v-btn text icon class="mb-2 ml-2" @click="exportVoucher" color="#2E7D32">
            <v-icon>mdi-microsoft-excel</v-icon>
          </v-btn> -->
        </v-toolbar>
      </template>

      <template v-slot:[`item.image`]="{ value }">
        <a :href="value" target="_blank">
          {{ value | truncate(20, "...") }}
          <span class="mdi mdi-open-in-new"></span>
        </a>
      </template>

      <template v-slot:[`body.prepend`]="{ headers }">
        <tr class="mx-0 px-0">
          <td :colspan="headers.length" class="mx-0 px-0">
            <v-text-field v-model="search" prepend-inner-icon="mdi-magnify" label="Search" single-line hide-details
              filled class="px-0 mx-0" />
          </td>
        </tr>
      </template>

      <template v-slot:[`item.actions`]="{ item }">
        <v-tooltip top>
          <template v-slot:activator="{ on, attrs }">
            <v-icon dark v-bind="attrs" v-on="on" medium class="mr-2" @click="validateItem(item)" color="warning">
              mdi-sticker-check
            </v-icon>
          </template>
          <span>Xác nhận dùng voucher</span>
        </v-tooltip>

        <v-icon medium v-if="isVoucherManager" @click="editItem(item)" color="primary">
          mdi-pencil
        </v-icon>
        <v-icon small v-if="isAdmin" @click="deleteItem(item)" color="error">
          mdi-delete
        </v-icon>
      </template>
      <template v-slot:no-data>
        <v-btn v-if="isAdmin" color="primary" @click="addOldData">Add data</v-btn>
      </template>
    </v-data-table>

    <v-snackbar v-model="snack" :timeout="3000" :color="snackColor">
      {{ snackText }}
      <template v-slot:action="{ attrs }">
        <v-btn v-bind="attrs" text @click="snack = false">Close</v-btn>
      </template>
    </v-snackbar>
  </div>
</template>
  
<script>
import { mapActions, mapGetters } from "vuex";
import exportFromJSON from "export-from-json";
import * as utils from '../../utils/index';
import * as constants from '../../constants/index';

export default {
  data() {
    return {
      doctorIds: ['VUU64298', 'PHA09570'],
      contentPromotions: ['Miễn viện phí', 'Miễn phí chữa trị truyền máu thẳng (không cần quét MRI)'],
      isAdmin: false,
      isVoucherManager: false,
      snack: false,
      snackColor: "",
      snackText: "",
      search: "",
      loading: true,
      dialog: false,
      voucherDialog: false,
      headers: [
        {
          text: "Tên",
          align: "start",
          sortable: true,
          value: "name",
        },
        {
          text: "Mã ưu đãi",
          sortable: true,
          value: "codePromotion",
        },
        {
          text: "Số lượng",
          sortable: true,
          value: "quantity",
        },
        {
          text: "Nội dung ưu đãi",
          sortable: true,
          value: "contentPromotion",
        },
        { text: "Thao tác", value: "actions", sortable: false },
      ],
      editedIndex: -1,
      editedItem: {
        name: "",
        contentPromotion: "",
        quantity: 0,
        codePromotion: "",
        doctorId: "",
        timeUsed: "",
        doctorUsed: "",
        codeAuthentication: "",
      },
      validatedItem: {
        codeAuthentication: "",
        timeUsed: "",
        doctorUsed: "",
      },
      defaultItem: {
        name: "",
        contentPromotion: "",
        quantity: 0,
        codePromotion: "",
        doctorId: "",
        timeUsed: "",
        doctorUsed: "",
        codeAuthentication: "",
      },
      fieldRule: [(v) => !!v || "Dữ liệu bắt buộc"],
      logItem: {
        name: "",
        category: "voucher",
        content: "",
        time: "",
      },
      userData: {
        uid: ""
      },
    };
  },

  computed: {
    ...mapActions({
      loadVouchers: "vouchers/loadVouchers",
    }),
    ...mapGetters({
      vouchers: "vouchers/getVouchers",
      user: "auth/user",
    }),
    formTitle() {
      return this.editedIndex === -1 ? "Thông Tin" : "Thông Tin";
    },
  },

  watch: {
    dialog(val) {
      val || this.close();
    },
  },

  created() {
    this.initialize();
  },

  methods: {
    ...mapActions({
      addVoucher: "vouchers/addVoucher",
      updateVoucher: "vouchers/updateVoucher",
      removeVoucher: "vouchers/removeVoucher",
      addLog: "logs/addLog",
      getAccount: "accounts/getAccount",
      getVoucher: "vouchers/getVoucher",
    }),

    async initialize() {
      this.loading = true;
      this.logItem.name = this.user.data.displayName

      this.userData.uid = this.user.data.uid
      await this.getAccount(this.userData)
      const account = await this.getAccount(this.userData)

      if (account?.role?.includes("Admin") || constants.adminUser.includes(this.user.data.email)) {
        this.isAdmin = true
        this.isVoucherManager = true
      }

      if (account?.role?.includes("VoucherManager")) {
        this.isVoucherManager = true
      }

      try {
        await this.loadVouchers;
      } catch (e) {
        console.error(e);
      }
      this.loading = false;
    },

    async editItem(item) {
      const getNewData = await this.getVoucher(item);
      const newData = getNewData.data()

      this.editedIndex = this.vouchers.indexOf(item);
      this.editedItem = Object.assign({}, item);

      if (Number(item.quantity) !== Number(newData.quantity)
        || item.codePromotion !== newData.codePromotion
        || item.contentPromotion !== newData.contentPromotion
        || item.doctorId !== newData.doctorId
        || item.doctorUsed !== newData.doctorUsed
        || item.name !== newData.name
        || item.timeUsed !== newData.timeUsed) {
        this.editedItem.quantity = Number(newData.quantity)
        this.editedItem.codePromotion = newData.codePromotion
        this.editedItem.contentPromotion = newData.contentPromotion
        this.editedItem.doctorId = newData.doctorId
        this.editedItem.doctorUsed = newData.doctorUsed
        this.editedItem.name = newData.name
        this.editedItem.timeUsed = newData.timeUsed

        await this.updateVoucher({
          index: this.editedIndex,
          voucher: this.editedItem,
        });
      }

      this.dialog = true;
    },

    async validateItem(item) {
      const getNewData = await this.getVoucher(item);
      const newData = getNewData.data()

      this.editedIndex = this.vouchers.indexOf(item);
      this.editedItem = Object.assign({}, item);

      if (Number(item.quantity) !== Number(newData.quantity)) {
        this.editedItem.quantity = Number(newData.quantity)

        await this.updateVoucher({
          index: this.editedIndex,
          voucher: this.editedItem,
        });

        if (Number(newData.quantity) === 0) {
          this.close();

          this.snack = true;
          this.snackColor = "error";
          this.snackText = "Voucher hết số lần sử dụng";
          return
        }
      } else if (Number(newData.quantity) === 0) {
        this.close();

        this.snack = true;
        this.snackColor = "error";
        this.snackText = "Voucher hết số lần sử dụng";
        return
      }

      this.voucherDialog = true;
    },

    async deleteItem(item) {
      this.loading = true;
      if (confirm("Chắc chắn là XÓA nha?")) {
        this.loading = true;
        try {
          await this.removeVoucher(item);
          // storage().refFromURL(item.image).delete();
          this.loading = false;

          this.snack = true;
          this.snackColor = "success";
          this.snackText = "Xóa thông tin người này thành công";
        } catch (e) {
          this.loading = false;

          this.snack = true;
          this.snackColor = "error";
          this.snackText = "Xóa thông tin người này không thành công";

          console.error(e);
        }
      } else {
        this.loading = false;
      }
    },

    async deleteAll() {
      this.loading = true;
      if (this.isAdmin) {
        if (confirm("Chắc chắn là XÓA HẾT đó nha?")) {
          this.loading = true;
          try {
            const data = this.vouchers;
            await data.forEach(async item => {
              await this.removeVoucher(item)
            })
            this.snack = true;
            this.snackColor = "success";
            this.snackText = "Xóa thông tin thành công";
            this.loading = false;
          } catch (e) {
            this.loading = false;

            this.snack = true;
            this.snackColor = "error";
            this.snackText = "Xóa thông tin không thành công";

            console.error(e);
          }
        }
        this.loading = false;

      } else {
        this.snack = true;
        this.snackColor = "error";
        this.snackText = "Bạn không có quyền xóa";
        this.loading = false;
      }
    },

    close() {
      this.dialog = false;
      this.voucherDialog = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.validatedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },

    async useVoucher() {
      if (!this.$refs.voucherDialogForm.validate()) return;

      // remove this condition in the next udpate
      if (this.editedItem.codeAuthentication === 'ZBW94170') {
        this.editedItem.codeAuthentication = 'PHA09570'
      }

      if (this.editedItem.codeAuthentication === this.editedItem.doctorId) {
        if (this.editedItem.quantity > 0) {
          this.loading = true;

          const nowTime = utils.changeTimeZone(new Date(), 'Asia/Ho_Chi_Minh');
          this.editedItem.timeUsed = nowTime.toLocaleString()
          this.editedItem.doctorUsed = this.user.data.displayName
          this.editedItem.quantity = Number(this.editedItem.quantity) - 1
          this.editedItem.codeAuthentication = ''

          await this.updateVoucher({
            index: this.editedIndex,
            voucher: this.editedItem,
          });

          this.logItem.time = nowTime.toLocaleString()
          this.logItem.name = this.user.data.displayName
          this.logItem.content = `Sử dụng cho: ${this.editedItem.name}, Voucher còn lại ${this.editedItem.quantity} lần`
          await this.addLog(this.logItem);

          this.loading = false;
          this.close();
          this.snack = true;
          this.snackColor = "success";
          this.snackText = "Sử dụng voucher thành công";
        } else {
          this.loading = false;
          this.close();

          this.snack = true;
          this.snackColor = "error";
          this.snackText = "Voucher hết số lần sử dụng";
        }
      } else {
        this.loading = false;

        this.snack = true;
        this.snackColor = "error";
        this.snackText = "Mã ưu đãi không chính xác";
      }
    },

    async save() {
      if (!this.$refs.dialogForm.validate()) return;

      if (this.isAdmin || this.isVoucherManager) {

        if (this.editedIndex > -1) {
          this.loading = true;
          try {
            await this.updateVoucher({
              index: this.editedIndex,
              voucher: this.editedItem,
            });
            this.loading = false;
            this.close();

            this.snack = true;
            this.snackColor = "success";
            this.snackText = "Lưu thông tin thành công";
          } catch (e) {
            this.loading = false;
            this.close();

            this.snack = true;
            this.snackColor = "error";
            this.snackText = "Lưu thông tin không thành công";

            console.error(e);
          }
        } else {
          this.loading = true;
          try {
            await this.addVoucher(this.editedItem);
            this.loading = false;
            this.close();

            this.snack = true;
            this.snackColor = "success";
            this.snackText = "Thêm thông tin thành công";
          } catch (e) {
            this.loading = false;
            this.close();

            this.snack = true;
            this.snackColor = "error";
            this.snackText = "Thêm thông tin không thành công";

            console.error(e);
          }
        }
      } else {
        this.close()
        this.snack = true;
        this.snackColor = "error";
        this.snackText = "Bạn không có quyền thêm thông tin mới";
        this.loading = false;
      }
    },

    async exportVoucher() {
      this.loading = true;
      const currentDay = new Date().getDate();
      const currentMonth = new Date().getMonth() + 1;
      try {
        if (this.isAdmin) {
          const data = this.vouchers;
          const fileName = "voucher-" + currentDay + "-" + currentMonth;
          const exportType = exportFromJSON.types.xls;

          if (data) exportFromJSON({ data, fileName, exportType });
        } else {
          this.snack = true;
          this.snackColor = "error";
          this.snackText = "Bạn không có quyền xuất file";
        }
      } catch (e) {
        console.error(e);
      }
      this.loading = false;
    },

    async addOldData() {
      const data = null
      if (data) {
        try {
          data.forEach(async e => {
            await this.addVoucher(e);
          })
        } catch (e) {
          this.loading = false;
          console.error(e);
        }
      } else {
        console.log('import error')
      }
    },

    uppercase() {
      this.editedItem.codeAuthentication = this.editedItem.codeAuthentication.toUpperCase();
    },
  },

  filters: {
    truncate: function (text, length, suffix) {
      if (text.length > length) {
        return text.substring(0, length) + suffix;
      } else {
        return text;
      }
    },
  },
};
</script>