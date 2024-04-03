<template>
  <div>
    <v-data-table :headers="headers" :items="healthInsuranceStorage" :search="search" class="elevation-1"
      :loading="loading" loading-text="Loading... Please wait">
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>Bảo Hiểm Y Tế</v-toolbar-title>
          <v-divider class="mx-4" inset vertical />
          <v-spacer />

          <v-dialog v-model="dialog" max-width="500px">
            <template v-slot:activator="{ on, attrs }">
              <v-btn color="primary" dark class="mb-2" v-bind="attrs" v-on="on">Đăng ký</v-btn>
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
                      <v-col cols="8" sm="8" md="8">
                        <v-text-field :disabled="loading" :rules="fieldRule" v-model="editedItem.idCard"
                          label="Chứng minh thư (ID)">
                        </v-text-field>
                      </v-col>
                      <v-col class="d-flex" cols="4" sm="4" md="4">
                        <v-select :items="genderType" :disabled="loading" :rules="fieldRule" v-model="editedItem.gender"
                          label="Giới tính"></v-select>
                      </v-col>

                      <v-col cols="12" sm="12" md="12">
                        <v-menu :rules="fieldRule" v-model="menu" :close-on-content-click="false" :nudge-right="40"
                          transition="scale-transition" offset-y min-width="auto">
                          <template v-slot:activator="{ on, attrs }">
                            <v-text-field v-model="editedItem.expiredTime" label="Ngày hết hạn (Năm-Tháng-Ngày) GMT+7"
                              readonly v-bind="attrs" v-on="on">
                            </v-text-field>
                          </template>
                          <v-date-picker v-model="editedItem.expiredTime" @input="menu = false"></v-date-picker>
                        </v-menu>
                      </v-col>

                      <v-col class="d-flex" cols="12" sm="12" md="12">
                        <v-select :items="healthInsuranceTypes" :disabled="loading" :rules="fieldRule"
                          v-model="editedItem.healthInsuranceType" label="Gói Bảo Hiểm Y Tế"></v-select>
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

          <v-dialog v-model="healthInsuranceDialog" max-width="500px">
            <v-card>
              <v-card-title>
                <span class="headline">{{ formTitle }}</span>
              </v-card-title>

              <v-card-text>
                <v-container>
                  <v-form v-bind:disabled="loading" lazy-validation ref="healthInsuranceDialogForm">
                    <v-row>
                      <v-col cols="12" sm="12" md="12">
                        <b>
                          <v-text-field disabled v-model="editedItem.name" label="Tên">
                          </v-text-field>
                        </b>
                      </v-col>
                      <v-col cols="7" sm="7" md="7">
                        <b>
                          <v-text-field disabled v-model="editedItem.idCard" label="Chứng minh thư (ID)">
                          </v-text-field>
                        </b>
                      </v-col>
                      <v-col cols="5" sm="5" md="5">
                        <b>
                          <v-text-field disabled v-model="editedItem.gender" label="Giới tính">
                          </v-text-field>
                        </b>
                      </v-col>

                      <v-col cols="12" sm="12" md="12">
                        <b>
                          <v-text-field disabled v-model="editedItem.expiredTime"
                            label="Ngày hết hạn (Năm-Tháng-Ngày) GMT+7">
                          </v-text-field>
                        </b>
                      </v-col>

                      <v-col cols="7" sm="7" md="7">
                        <b>
                          <v-text-field disabled v-model="editedItem.healthInsuranceType" label="Gói Bảo Hiểm Y Tế">
                          </v-text-field>
                        </b>
                      </v-col>
                      <v-col cols="5" sm="5" md="5">
                        <b>
                          <v-text-field disabled v-model="editedItem.medkitRemainning" label="Medkit còn lại">
                          </v-text-field>
                        </b>
                      </v-col>

                      <v-col cols="7" sm="7" md="7">
                        <v-text-field disabled v-model="editedItem.timeUsed" label="Sử dụng Medkit lần cuối">
                        </v-text-field>
                      </v-col>
                      <v-col cols="5" sm="5" md="5">
                        <v-text-field disabled v-model="editedItem.doctorUsed" label="Bác sĩ sử dụng">
                        </v-text-field>
                      </v-col>

                      <v-col cols="12" sm="12" md="12">
                        <v-btn block color="warning" dark class="mb-2" @click="useMedkit">Sử dụng Medkit (-1)</v-btn>
                      </v-col>

                    </v-row>
                  </v-form>
                </v-container>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn :disabled="loading" color="blue darken-1" text @click="close">Xong</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>

          <v-btn text icon v-if="isAdmin" class="mb-2 ml-2" @click="deleteAll" color="error">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
          <v-btn text icon v-if="isAdmin" class="mb-2 ml-2" @click="exportHealthInsurance" color="#2E7D32">
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
        <v-tooltip top>
          <template v-slot:activator="{ on, attrs }">
            <v-icon dark v-bind="attrs" v-on="on" medium class="mr-2" @click="validateItem(item)" color="warning">
              mdi-eye
            </v-icon>
          </template>
          <span>Xem thông tin / Sử dụng Medkit</span>
        </v-tooltip>

        <v-icon medium v-if="isAdmin" @click="editItem(item)" color="primary">
          mdi-pencil
        </v-icon>
        <v-icon small @click="deleteItem(item)" color="error">
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
      modal: false,
      menu: false,
      medkitRemained: "",

      healthInsuranceTypes: ['Gói 1'],
      genderType: ['Nam', 'Nữ'],
      isAdmin: false,
      isChiefDoctor: false,
      snack: false,
      snackColor: "",
      snackText: "",
      search: "",
      loading: true,
      dialog: false,
      healthInsuranceDialog: false,
      headers: [
        {
          text: "Tên",
          align: "start",
          sortable: true,
          value: "name",
        },
        {
          text: "Giới tính",
          sortable: true,
          value: "gender",
        },
        {
          text: "Ngày hết hạn (Năm-Tháng-Ngày) GMT+7",
          sortable: true,
          value: "expiredTime",
        },

        { text: "Thao tác", value: "actions", sortable: false },
      ],
      editedIndex: -1,

      editedItem: {
        name: "",
        gender: "",
        expiredTime: (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10),
        healthInsuranceType: "",
        medkitRemainning: "",
        timeUsed: "",
        doctorUsed: "",
        doctorCreated: "",
        doctorCreatedAt: "",
      },
      defaultItem: {
        name: "",
        gender: "",
        expiredTime: (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10),
        healthInsuranceType: "",
        medkitRemainning: "",
        timeUsed: "",
        doctorUsed: "",
        doctorCreated: "",
        doctorCreatedAt: "",
      },
      fieldRule: [(v) => !!v || "Dữ liệu bắt buộc"],
      logItem: {
        name: "",
        category: "bao-hiem-y-te",
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
      loadHealthInsuranceStorage: "healthInsuranceStorage/loadHealthInsuranceStorage",
    }),
    ...mapGetters({
      healthInsuranceStorage: "healthInsuranceStorage/getHealthInsuranceStorage",
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
  },

  methods: {

    ...mapActions({
      addHealthInsurance: "healthInsuranceStorage/addHealthInsurance",
      updateHealthInsurance: "healthInsuranceStorage/updateHealthInsurance",
      removeHealthInsurance: "healthInsuranceStorage/removeHealthInsurance",
      addLog: "logs/addLog",
      getAccount: "accounts/getAccount",
      getHealthInsurance: "healthInsuranceStorage/getHealthInsurance",
    }),

    async initialize() {
      this.loading = true;
      this.logItem.name = this.user.data.displayName

      this.userData.uid = this.user.data.uid
      await this.getAccount(this.userData)
      const account = await this.getAccount(this.userData)

      if (account?.role?.includes("Admin") || constants.adminUser.includes(this.user.data.email)) {
        this.isAdmin = true
        this.isChiefDoctor = true
      }

      if (account?.role?.includes("ChiefDoctor")) {
        this.isChiefDoctor = true
      }

      try {
        await this.loadHealthInsuranceStorage;
      } catch (e) {
        console.error(e);
      }
      this.loading = false;
    },

    editItem(item) {
      this.editedIndex = this.healthInsuranceStorage.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

    async validateItem(item) {
      const getNewData = await this.getHealthInsurance(item);
      const newData = getNewData.data()

      this.editedIndex = this.healthInsuranceStorage.indexOf(item);
      this.editedItem = Object.assign({}, item);

      if (Number(item.medkitRemainning) !== Number(newData.medkitRemainning)) {
        this.editedItem.medkitRemainning = Number(newData.medkitRemainning)

        await this.updateHealthInsurance({
          index: this.editedIndex,
          healthInsurance: this.editedItem,
        });
      }

      this.healthInsuranceDialog = true;
    },

    async deleteItem(item) {
      this.loading = true;
      if (this.user.data.displayName === item.doctorCreated || this.isAdmin) {
        if (confirm("Chắc chắn là XÓA nha?")) {
          this.loading = true;
          try {
            await this.removeHealthInsurance(item);
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
      } else {
        this.snack = true;
        this.snackColor = "error";
        this.snackText = "Bạn không có quyền xóa";
        this.loading = false;
      }
    },

    async deleteAll() {
      this.loading = true;
      if (this.isAdmin) {
        if (confirm("Chắc chắn là XÓA HẾT đó nha?")) {
          this.loading = true;
          try {
            const data = this.healthInsuranceStorage;
            await data.forEach(async item => {
              await this.removeHealthInsurance(item)
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
      this.healthInsuranceDialog = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.validatedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },

    async save() {
      if (!this.$refs.dialogForm.validate()) return;

      if (this.isAdmin || this.isChiefDoctor) {

        if (this.editedIndex > -1) {
          this.loading = true;
          try {
            await this.updateHealthInsurance({
              index: this.editedIndex,
              healthInsurance: this.editedItem,
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
            const nowTime = utils.changeTimeZone(new Date(), 'Asia/Ho_Chi_Minh');
            this.editedItem.doctorCreatedAt = nowTime.toLocaleString()
            this.editedItem.doctorCreated = this.user.data.displayName

            if (this.editedItem.healthInsuranceType === "Gói 1") {
              this.editedItem.medkitRemainning = 30
            }
            await this.addHealthInsurance(this.editedItem);
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
        this.snackText = "Bạn không có quyền đăng kí mới";
        this.loading = false;
      }
    },

    async exportHealthInsurance() {
      this.loading = true;
      const currentDay = new Date().getDate();
      const currentMonth = new Date().getMonth() + 1;
      try {
        if (this.isAdmin) {
          const data = this.healthInsuranceStorage;
          const fileName = "bao-hiem-y-te-" + currentDay + "-" + currentMonth;
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
            await this.addHealthInsurance(e);
          })
        } catch (e) {
          this.loading = false;
          console.error(e);
        }
      } else {
        console.log('import error')
      }
    },

    async useMedkit() {

      const nowTime = utils.getTimeGMT7(new Date(), 'Asia/Ho_Chi_Minh');
      const convertExpiredTime = utils.getTimeGMT7(new Date(`${this.editedItem.expiredTime}`), 'Asia/Ho_Chi_Minh');

      if (nowTime.year <= convertExpiredTime.year && nowTime.month <= convertExpiredTime.month && nowTime.date <= convertExpiredTime.date) {
        if (Number(this.editedItem.medkitRemainning) !== 0) {
          if (this.editedItem.medkitRemainning > 0) {
            this.loading = true;

            const nowTime = utils.changeTimeZone(new Date(), 'Asia/Ho_Chi_Minh');
            this.editedItem.timeUsed = nowTime.toLocaleString()
            this.editedItem.doctorUsed = this.user.data.displayName
            this.editedItem.medkitRemainning = Number(this.editedItem.medkitRemainning) - 1

            await this.updateHealthInsurance({
              index: this.editedIndex,
              healthInsurance: this.editedItem,
            });

            this.logItem.time = nowTime.toLocaleString()
            this.logItem.name = this.user.data.displayName
            this.logItem.content = `Sử dụng cho: ${this.editedItem.name}, Medkit còn lại ${this.editedItem.medkitRemainning} lần`
            await this.addLog(this.logItem);

            this.loading = false;
            this.snack = true;
            this.snackColor = "success";
            this.snackText = "Sử dụng medkit thành công";
          } else {
            this.loading = false;

            this.snack = true;
            this.snackColor = "error";
            this.snackText = "Medkit hết số lần sử dụng";
          }
        } else {
          this.loading = false;

          this.snack = true;
          this.snackColor = "error";
          this.snackText = "Medkit hết số lần sử dụng";
        }
      } else {
        this.loading = false;

        this.snack = true;
        this.snackColor = "error";
        this.snackText = "Bảo hiểm y tế đã hết hạn sử dụng";
      }
      return

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