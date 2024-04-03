<template>
  <div>
    <v-data-table :headers="headers" :items="bloodstorage" :search="search" class="elevation-1" :loading="loading"
      loading-text="Loading... Please wait">
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>Danh Sách Hiến Máu</v-toolbar-title>
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
                      <v-col cols="4" sm="4" md="4">
                        <v-text-field :disabled="loading" :rules="fieldRule" v-model="editedItem.bloodtype"
                          label="Nhóm Máu" @keyup="uppercase" class="bloodtype"></v-text-field>
                      </v-col>
                      <v-col cols="4" sm="4" md="4">
                        <v-text-field disabled v-model="editedItem.accumulation" label="Tích Lũy" type="number">
                        </v-text-field>
                      </v-col>
                      <v-col cols="4" sm="4" md="4">
                        <v-text-field disabled v-model="editedItem.total" label="Tổng" type="number">
                        </v-text-field>
                      </v-col>
                      <v-col cols="12" sm="12" md="12">
                        <v-text-field disabled v-model="editedItem.lasttime" label="Thời gian hiến máu lần cuối">
                        </v-text-field>
                      </v-col>
                      <v-col cols="12" sm="12" md="12">
                        <v-text-field disabled v-model="editedItem.actionBy" label="Ghi nhận bởi">
                        </v-text-field>
                      </v-col>
                      <v-col cols="12" sm="12" md="6">
                        <v-btn block color="warning" dark class="mb-2" @click="subtract">Đổi
                          điểm (-2)</v-btn>
                      </v-col>
                      <v-col cols="12" sm="12" md="6">
                        <v-btn block color="primary" dark class="mb-2" @click="plus">Tích điểm (+1)</v-btn>
                      </v-col>
                      <v-col cols="12" sm="12" md="12" v-if="pointDeducted !== 0">
                        <span class="red--text">Đã trừ <b>{{ pointDeducted }}</b> điểm</span>
                      </v-col>
                      <v-col cols="12" sm="12" md="12">
                        <span class="lead text--secondary my-2">Liên hệ bác sĩ
                          <a href="https://discordapp.com/users/676718666401841152/" class="text-decoration-none"
                            target="_blank">Hanwool</a> nếu có sai sót ở điểm Tổng
                        </span>
                      </v-col>
                      <v-col cols="12" sm="12" md="6" v-if="isAdmin">
                        <v-btn block color="warning" dark class="mb-2" @click="subtractTotal">Trừ Tổng (-1)</v-btn>
                      </v-col>
                      <v-col cols="12" sm="12" md="6" v-if="isAdmin">
                        <v-btn block color="primary" dark class="mb-2" @click="plusTotal">Cộng Tổng (+1)</v-btn>
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

          <v-btn v-if="isAdmin" text icon class="mb-2 ml-2" @click="resetPoint" color="error">
            <v-icon>mdi-file-restore-outline</v-icon>
          </v-btn>
          <v-btn v-if="isAdmin" text icon class="mb-2 ml-2" @click="exportBlood" color="#2E7D32">
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
            <v-icon dark v-bind="attrs" v-on="on" medium class="mr-2" @click="editItem(item)" color="warning">
              mdi-plus-minus-variant
            </v-icon>
          </template>
          <span>Cập nhật / Tích - Đổi điểm</span>
        </v-tooltip>
        
        <v-icon small v-if="isAdmin" @click="deleteItem(item)" color="error">
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
      isAdmin: false,
      pointDeducted: 0,
      snack: false,
      snackColor: "",
      snackText: "",
      search: "",
      loading: true,
      dialog: false,
      headers: [
        {
          text: "Tên",
          align: "start",
          sortable: true,
          value: "name",
        },
        {
          text: "Tích Lũy",
          sortable: true,
          value: "accumulation",
        },
        {
          text: "Tổng",
          sortable: true,
          value: "total",
        },
        {
          text: "Nhóm Máu",
          sortable: true,
          value: "bloodtype",
        },
        {
          text: "Thời Gian Hiến Lần Cuối",
          sortable: true,
          value: "lasttime",
        },
        { text: "Thao tác", value: "actions", sortable: false },
      ],
      editedIndex: -1,
      editedItem: {
        name: "",
        accumulation: 0,
        total: 0,
        lasttime: "",
        actionBy: "",
        bloodtype: "",
      },
      defaultItem: {
        name: "",
        accumulation: 0,
        total: 0,
        lasttime: "",
        actionBy: "",
        bloodtype: "",
      },
      fieldRule: [(v) => !!v || "Dữ liệu bắt buộc"],
      logItem: {
        name: "",
        category: "hien-mau",
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
      loadBloodStorage: "bloodstorage/loadBloodStorage",
    }),
    ...mapGetters({
      bloodstorage: "bloodstorage/getBloodStorage",
      user: "auth/user",
    }),
    formTitle() {
      return this.editedIndex === -1 ? "Thông Tin" : "Tích Lũy / Đổi Điểm";
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
      addBlood: "bloodstorage/addBlood",
      updateBlood: "bloodstorage/updateBlood",
      removeBlood: "bloodstorage/removeBlood",
      getBlood: "bloodstorage/getBlood",
      addLog: "logs/addLog",
      getAccount: "accounts/getAccount",
    }),

    async initialize() {
      this.loading = true;
      try {
        await this.loadBloodStorage;
      } catch (e) {
        console.error(e);
      }

      this.userData.uid = this.user.data.uid
      await this.getAccount(this.userData)
      const account = await this.getAccount(this.userData)

      if (account?.role?.includes("Admin") || constants.adminUser.includes(this.user.data.email)) {
        this.isAdmin = true
      }

      this.logItem.name = this.user.data.displayName
      this.loading = false;
    },

    async editItem(item) {
      this.pointDeducted = 0;

      const getNewData = await this.getBlood(item);
      const newData = getNewData.data()

      this.editedIndex = this.bloodstorage.indexOf(item);
      this.editedItem = Object.assign({}, item);

      if (item.accumulation !== newData.accumulation) {
        this.editedItem.accumulation = newData.accumulation
        this.editedItem.actionBy = newData.actionBy
        this.editedItem.total = newData.total
        this.editedItem.lasttime = newData.lasttime

        await this.updateBlood({
          index: this.editedIndex,
          blood: this.editedItem,
        });
      }

      this.dialog = true;
    },

    async deleteItem(item) {
      this.loading = true;
      if (confirm("Chắc chắn là XÓA nha?")) {
        this.loading = true;
        try {
          await this.removeBlood(item);
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

    close() {
      this.dialog = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },

    async save() {
      if (!this.$refs.dialogForm.validate()) return;
      const nowTime = utils.changeTimeZone(new Date(), 'Asia/Ho_Chi_Minh');

      if (this.editedIndex > -1) {
        this.loading = true;
        try {
          await this.updateBlood({
            index: this.editedIndex,
            blood: this.editedItem,
          });
          this.loading = false;
          this.close();

          this.logItem.time = nowTime.toLocaleString()
          this.logItem.content = `cập nhật cư dân: ${this.editedItem.name}`
          await this.addLog(this.logItem);

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
          await this.addBlood(this.editedItem);
          this.loading = false;
          this.close();

          this.logItem.time = nowTime.toLocaleString()
          this.logItem.content = `đăng kí cư dân: ${this.editedItem.name}`
          await this.addLog(this.logItem);

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
    },

    async plus() {
      if (!this.$refs.dialogForm.validate()) return;

      if (this.formTitle === 'Tích Lũy / Đổi Điểm') {
        if (this.editedIndex > -1) {
          this.loading = true;
          const currentPoint = this.editedItem.accumulation

          const nowTime = utils.changeTimeZone(new Date(), 'Asia/Ho_Chi_Minh');
          this.editedItem.lasttime = nowTime.toLocaleString()
          this.defaultItem.lasttime = nowTime.toLocaleString()

          this.editedItem.actionBy = this.user.data.displayName
          this.defaultItem.actionBy = this.user.data.displayName
          if (this.editedItem.accumulation === 0) {
            this.editedItem.accumulation = Number(this.editedItem.accumulation) + 1
            this.editedItem.total = Number(this.editedItem.total) + 1
          } else {
            this.editedItem.accumulation = Number(this.editedItem.accumulation) + 1
            this.editedItem.total = Number(this.editedItem.total) + 1
          }
          try {
            await this.updateBlood({
              index: this.editedIndex,
              blood: this.editedItem,
            });
            this.loading = false;

            this.logItem.time = nowTime.toLocaleString()
            this.logItem.content = `tích điểm cư dân: ${this.editedItem.name} từ ${currentPoint} lên ${this.editedItem.accumulation}`
            await this.addLog(this.logItem);

          } catch (e) {
            this.loading = false;
            this.close();
            console.error(e);
          }
        }
      } else {
        this.snack = true;
        this.snackColor = "error";
        this.snackText = "Không tích/đổi điểm trong quá trình đăng kí mới";
      }
    },

    async subtract() {
      if (!this.$refs.dialogForm.validate()) return;

      if (this.formTitle === 'Tích Lũy / Đổi Điểm') {
        if (this.editedIndex > -1) {
          const currentPoint = this.editedItem.accumulation

          if (this.editedItem.accumulation >= 2) {
            this.editedItem.accumulation = Number(this.editedItem.accumulation) - 2
            this.pointDeducted = this.pointDeducted + 2
          }

          try {
            await this.updateBlood({
              index: this.editedIndex,
              blood: this.editedItem,
            });
            this.loading = false;

            const nowTime = utils.changeTimeZone(new Date(), 'Asia/Ho_Chi_Minh');
            this.logItem.time = nowTime.toLocaleString()
            this.logItem.content = `đổi điểm cư dân: ${this.editedItem.name} từ ${currentPoint} xuống ${this.editedItem.accumulation}`
            await this.addLog(this.logItem);

          } catch (e) {
            this.loading = false;
            this.close();
            console.error(e);
          }
        }
      } else {
        this.snack = true;
        this.snackColor = "error";
        this.snackText = "Không tích/đổi điểm trong quá trình đăng kí mới";
      }
    },

    async plusTotal() {
      if (!this.$refs.dialogForm.validate()) return;

      if (this.editedIndex > -1) {
        this.loading = true;
        this.editedItem.total = Number(this.editedItem.total) + 1

        try {
          await this.updateBlood({
            index: this.editedIndex,
            blood: this.editedItem,
          });
          this.loading = false;

        } catch (e) {
          this.loading = false;
          this.close();
          console.error(e);
        }
      }
    },

    async subtractTotal() {
      if (!this.$refs.dialogForm.validate()) return;

      if (this.editedIndex > -1) {
        if (this.editedItem.total > 0) {
          this.editedItem.total = Number(this.editedItem.total) - 1
        }

        try {
          await this.updateBlood({
            index: this.editedIndex,
            blood: this.editedItem,
          });
          this.loading = false;

        } catch (e) {
          this.loading = false;
          this.close();
          console.error(e);
        }
      }
    },

    uppercase() {
      this.editedItem.bloodtype = this.editedItem.bloodtype.toUpperCase();
    },

    async exportBlood() {
      this.loading = true;
      const currentDay = new Date().getDate();
      const currentMonth = new Date().getMonth() + 1;
      try {
        if (this.isAdmin) {
          const data = this.bloodstorage;
          const fileName = "hien-mau-" + currentDay + "-" + currentMonth;
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

    // TODO: need to fix Uncaught (in promise) TypeError: Cannot convert undefined or null to object
    async resetPoint() {
      this.loading = true;
      if (this.isAdmin) {
        this.loading = true;
        if (confirm("Chắc chắn là RESET HẾT đó nha?")) {
          try {
            const data = this.bloodstorage;
            await data.forEach(async item => {
              item.accumulation = 0
              item.total = 0
              await this.updateBlood({
                index: this.editedIndex,
                blood: item,
              });
            })

            this.snack = true;
            this.snackColor = "success";
            this.snackText = "Reset điểm tích lũy thành công";
            this.loading = false;
          } catch (e) {
            this.loading = false;

            this.snack = true;
            this.snackColor = "error";
            this.snackText = "Reset điểm tích lũy không thành công";

            console.error(e);
          }
        }
      } else {
        this.snack = true;
        this.snackColor = "error";
        this.snackText = "Bạn không có đủ thẩm quyền";
        this.loading = false;
      }
      this.loading = false;
    },

    async addOldData() {
      const data = null
      if (data) {
        try {
          data.forEach(async e => {
            await this.addBlood(e);
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