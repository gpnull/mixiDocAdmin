<template>
  <div>
    <v-data-table :headers="headers" :items="expenses" :search="search" class="elevation-1" :loading="loading"
      loading-text="Loading... Please wait">
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>Sao Kê Khoản Chi</v-toolbar-title>
          <v-divider class="mx-4" inset vertical />
          <v-spacer />

          <v-dialog v-model="dialog" max-width="500px">
            <template v-slot:activator="{ on, attrs }">
              <v-btn v-if="actived && !isIntern" color="primary" dark class="mb-2" v-bind="attrs" v-on="on">Tạo</v-btn>
              <v-btn v-else disabled class="mb-2" elevation="2">Tạo</v-btn>
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
                        <v-text-field disabled :rules="fieldRule" v-model="editedItem.name" label="Người Chi">
                        </v-text-field>
                      </v-col>

                      <v-col cols="12" sm="12" md="12">
                        <v-text-field :disabled="loading" v-model="editedItem.depotGarage" @keyup="depotGarageTyping"
                          label="Tiền chuộc xe kho phương tiện" type="number">
                        </v-text-field>
                      </v-col>

                      <v-col cols="6" sm="6" md="6">
                        <v-text-field :disabled="isInGarageDepot" v-model="editedItem.food" label="Bánh/Nước"
                          type="number">
                        </v-text-field>
                      </v-col>

                      <v-col cols="6" sm="6" md="6">
                        <v-text-field :disabled="isInGarageDepot" v-model="editedItem.socola" label="Socola"
                          type="number">
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

          <v-btn v-if="actived && isAdmin" text icon class="mb-2 ml-2" @click="unlock" color="#1DE9B6">
            <v-icon>mdi-lock-open-variant</v-icon>
          </v-btn>
          <v-btn v-else-if="!actived && isAdmin" text icon class="mb-2 ml-2" @click="unlock" color="error">
            <v-icon>mdi-lock</v-icon>
          </v-btn>
          <v-btn v-if="isAdmin" text icon class="mb-2 ml-2" @click="deleteAll" color="error">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
          <v-btn v-if="isAdmin" text icon class="mb-2 ml-2" @click="exportExpenses" color="#2E7D32">
            <v-icon>mdi-microsoft-excel</v-icon>
          </v-btn>
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
        <v-icon small @click="deleteItem(item)" color="error">
          mdi-delete
        </v-icon>
      </template>
      <template v-slot:no-data>
        <v-btn v-if="isAdmin" color="primary" @click="addOldData">Add Data</v-btn>
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
      isInGarageDepot: false,

      isAdmin: false,
      isIntern: false,
      actived: false,
      snack: false,
      snackColor: "",
      snackText: "",
      search: "",
      loading: true,
      dialog: false,
      headers: [
        {
          text: "Người Chi",
          align: "start",
          sortable: true,
          value: "name",
        },
        {
          text: "Thời Gian",
          sortable: true,
          value: "time",
        },
        {
          text: "Nội Dung Chi",
          sortable: true,
          value: "reason",
        },
        {
          text: "Số Tiền Chi",
          sortable: true,
          value: "amount",
        },
        { text: "Thao tác", value: "actions", sortable: false },
      ],
      editedIndex: -1,
      editedItem: {
        name: "",
        food: "0",
        socola: "0",
        depotGarage: "",
        reason: "",
        amount: "",
        time: (new Date()).toLocaleString()
      },
      defaultItem: {
        name: "",
        food: "0",
        socola: "0",
        depotGarage: "",
        reason: "",
        amount: "",
        time: (new Date()).toLocaleString()
      },
      fieldRule: [(v) => !!v || "Dữ liệu bắt buộc"],
      logItem: {
        name: "",
        category: "sao-ke-khoan-chi",
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
      loadExpenses: "expenses/loadExpenses",
      loadAllStatus: "allstatus/loadAllStatus",
    }),
    ...mapGetters({
      expenses: "expenses/getExpenses",
      allstatus: "allstatus/getAllStatus",
      user: "auth/user",
    }),
    formTitle() {
      return this.editedIndex === -1 ? "Thông Tin" : "";
    },
  },

  watch: {
    dialog(val) {
      val || this.close();
    },
  },

  created() {
    this.initialize();
    this.editedItem.name = this.user.data.displayName
    this.defaultItem.name = this.user.data.displayName
  },

  methods: {
    ...mapActions({
      addExpense: "expenses/addExpense",
      updateExpense: "expenses/updateExpense",
      removeExpense: "expenses/removeExpense",
      updateStatus: "allstatus/updateStatus",
      loadSaoKeKhoanChiStatus: "allstatus/loadSaoKeKhoanChiStatus",
      addLog: "logs/addLog",
      getAccount: "accounts/getAccount",
    }),

    async initialize() {
      this.loading = true;
      try {
        await this.loadExpenses;
        await this.loadAllStatus;
        const status = await this.loadSaoKeKhoanChiStatus();
        const statusDetail = status.data()
        this.actived = statusDetail.actived
      } catch (e) {
        console.error(e);
      }
      this.logItem.name = this.user.data.displayName

      this.userData.uid = this.user.data.uid
      await this.getAccount(this.userData)
      const account = await this.getAccount(this.userData)

      if (account?.role?.includes("Admin") || constants.adminUser.includes(this.user.data.email)) {
        this.isAdmin = true
      }

      if (account?.role?.includes("Intern")) {
        this.isIntern = true
      }

      this.loading = false;
    },

    depotGarageTyping() {
      if (Number(this.editedItem.depotGarage) !== 0) {
        if (this.editedItem.depotGarage === "") {
          this.isInGarageDepot = false
        } else {
          this.isInGarageDepot = true
          this.editedItem.food = 0
          this.editedItem.socola = 0
        }
      } else {
        this.isInGarageDepot = false
      }
    },

    async deleteItem(item) {
      this.loading = true;
      if (this.user.data.displayName === item.name) {
        if (confirm("Chắc chắn là XÓA nha?")) {
          this.loading = true;
          try {
            await this.removeExpense(item);
            this.loading = false;

            this.logItem.time = this.editedItem.time
            this.logItem.content = `xóa sao kê ngày ${item.time}`
            // await this.addLog(this.logItem);

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
        } else {
          this.loading = false;
        }
      } else {
        this.snack = true;
        this.snackColor = "error";
        this.snackText = "Bạn không có quyền xóa";
        this.loading = false;
      }
    },

    close() {
      this.dialog = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },

    async save() {
      if (!this.$refs.dialogForm.validate()) return;

      const status = await this.loadSaoKeKhoanChiStatus();
      const statusDetail = status.data()
      if (statusDetail.actived) {
        this.loading = true;
        const nowTime = utils.changeTimeZone(new Date(), 'Asia/Ho_Chi_Minh');

        if (this.isInGarageDepot) {
          this.editedItem.time = nowTime.toLocaleString()
          this.defaultItem.time = nowTime.toLocaleString()
          this.editedItem.reason = 'Chuộc xe kho phương tiện'
          this.editedItem.amount = Number(this.editedItem.depotGarage)

          this.isInGarageDepot = false
        } else {
          const foodCountRemoveFirstZero = utils.countRemoveFirstZeros(this.editedItem.food)
          let foodAmount = `${this.editedItem.food.replace(/\s+/g, '').slice(foodCountRemoveFirstZero, this.editedItem.food.length)}`

          const socolaCountRemoveFirstZero = utils.countRemoveFirstZeros(this.editedItem.socola)
          let socolaAmount = `${this.editedItem.socola.replace(/\s+/g, '').slice(socolaCountRemoveFirstZero, this.editedItem.socola.length)}`

          foodAmount = Number(foodAmount)
          socolaAmount = Number(socolaAmount)

          this.editedItem.time = nowTime.toLocaleString()
          this.defaultItem.time = nowTime.toLocaleString()
          this.editedItem.reason = `${foodAmount} Bánh/Nước + ${socolaAmount} Socola`
          this.editedItem.amount = foodAmount * 50 + socolaAmount * 200
        }

        this.loading = true;
        try {
          await this.addExpense(this.editedItem);
          this.loading = false;
          this.close();

          this.logItem.time = this.editedItem.time
          this.logItem.content = `tạo sao kê giá ${this.editedItem.amount}`
          // await this.addLog(this.logItem);

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
          this.loading = false;
        }
        this.loading = false;

      } else {
        if (confirm("Trạng thái Sao Kê hiện đang bị khóa. Vui lòng chờ Bác sĩ Hanwool kiểm tra")) {
          location.reload();
        }
      }
    },

    async exportExpenses() {
      this.loading = true;
      const currentDay = new Date().getDate();
      const currentMonth = new Date().getMonth() + 1;
      try {
        if (this.isAdmin) {
          const allStatus = await this.allstatus;
          await allStatus.forEach(async e => {
            if (e.id === "lR2PH2qeKEBwRXtAjA8L" && e.actived === true) {
              e.actived = false
              this.actived = false
              await this.updateStatus({
                index: this.editedIndex,
                status: e,
              });
            }
          })

          const data = this.expenses;
          const fileName = "sao-ke-khoan-chi-" + currentDay + "-" + currentMonth;
          const exportType = exportFromJSON.types.xls;

          if (data) exportFromJSON({ data, fileName, exportType });
        } else {
          this.snack = true;
          this.snackColor = "error";
          this.snackText = "Bạn không có quyền xuất file";
          this.loading = false;
        }
      } catch (e) {
        console.error(e);
      }
      this.loading = false;
    },

    async unlock() {
      this.loading = true;
      if (this.isAdmin) {
        const data = await this.allstatus;
        await data.forEach(async e => {
          if (e.id === "lR2PH2qeKEBwRXtAjA8L" && e.actived === false) {
            e.actived = true
            this.actived = true
            await this.updateStatus({
              index: this.editedIndex,
              status: e,
            });
          }
        })
      } else {
        this.snack = true;
        this.snackColor = "error";
        this.snackText = "Bạn không có quyền mở khóa";
        this.loading = false;
      }
      this.loading = false;
    },

    async deleteAll() {
      this.loading = true;
      if (this.isAdmin) {
        if (confirm("Chắc chắn là XÓA HẾT đó nha?")) {
          this.loading = true;
          try {
            const data = this.expenses;
            await data.forEach(async item => {
              await this.removeExpense(item)
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

      } else {
        this.snack = true;
        this.snackColor = "error";
        this.snackText = "Bạn không có quyền xóa";
        this.loading = false;
      }
    },

    async addOldData() {
      const data = null
      if (data) {
        try {
          data.forEach(async e => {
            await this.addExpense(e);
          })
        } catch (e) {
          this.loading = false;
          console.error(e);
        }
      } else {
        console.log('import error')
      }
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
