<template>
  <div>
    <v-data-table :headers="headers" :items="policeStation" :search="search" class="elevation-1" :loading="loading"
      loading-text="Loading... Please wait">
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>Hồ Sơ Bệnh Án Cảnh Sát</v-toolbar-title>
          <v-divider class="mx-4" inset vertical />
          <v-spacer />

          <v-dialog v-model="dialog" max-width="500px">
            <template v-slot:activator="{ on, attrs }">
              <v-btn v-if="actived" color="primary" dark class="mb-2" v-bind="attrs" v-on="on">Tạo</v-btn>
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
                        <v-text-field disabled v-model="editedItem.name" label="Người Ghi Nhận">
                        </v-text-field>
                      </v-col>
                      <v-col cols="12" sm="12" md="12">
                        <v-text-field :rules="fieldRule" v-model="editedItem.policeName" label="Đồng Chí">
                        </v-text-field>
                      </v-col>
                      <v-col cols="12" sm="12" md="12">
                        <v-text-field :disabled="loading" :rules="fieldRule" v-model="editedItem.reason"
                          label="Nội Dung"></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="12" md="12">
                        <v-text-field :disabled="loading" :rules="fieldRule" v-model="editedItem.amount" label="Số Tiền"
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

          <v-btn v-if="actived" text icon class="mb-2 ml-2" @click="unlock" color="#1DE9B6">
            <v-icon>mdi-lock-open-variant</v-icon>
          </v-btn>
          <v-btn v-else text icon class="mb-2 ml-2" @click="unlock" color="error">
            <v-icon>mdi-lock</v-icon>
          </v-btn>
          <v-btn text icon class="mb-2 ml-2" @click="deleteAll" color="error">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
          <v-btn text icon class="mb-2 ml-2" @click="exportPoliceStation" color="#2E7D32">
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
        <v-btn color="primary" @click="initialize">Reset</v-btn>
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

export default {
  data() {
    return {
      actived: false,
      snack: false,
      snackColor: "",
      snackText: "",
      search: "",
      loading: true,
      dialog: false,
      headers: [
        {
          text: "Người Ghi Nhận",
          align: "start",
          sortable: true,
          value: "name",
        },
        {
          text: "Đồng Chí",
          align: "start",
          sortable: true,
          value: "policeName",
        },
        // {
        //   text: "Thời Gian",
        //   sortable: true,  
        //   value: "time",
        // },
        {
          text: "Nội Dung",
          sortable: true,
          value: "reason",
        },
        {
          text: "Số Tiền",
          sortable: true,
          value: "amount",
        },
        { text: "Thao tác", value: "actions", sortable: false },
      ],
      editedIndex: -1,
      editedItem: {
        name: "",
        policeName: "",
        reason: "",
        amount: "",
        time: (new Date()).toLocaleString()
      },
      defaultItem: {
        name: "",
        policeName: "",
        reason: "",
        amount: "",
        time: (new Date()).toLocaleString()
      },
      fieldRule: [(v) => !!v || "Dữ liệu bắt buộc"],
    };
  },

  computed: {
    ...mapActions({
      loadPoliceStation: "policeStation/loadPoliceStation",
      loadAllStatus: "allstatus/loadAllStatus",
    }),
    ...mapGetters({
      policeStation: "policeStation/getPoliceStation",
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
      addPolice: "policeStation/addPolice",
      updatePolice: "policeStation/updatePolice",
      removePolice: "policeStation/removePolice",
      updateStatus: "allstatus/updateStatus",
      loadSaoKeCanhSatStatus: "allstatus/loadSaoKeCanhSatStatus",
    }),

    async initialize() {
      this.loading = true;
      try {
        await this.loadPoliceStation;
        await this.loadAllStatus;
        const status = await this.loadSaoKeCanhSatStatus();
        const statusDetail = status.data()
        this.actived = statusDetail.actived
      } catch (e) {
        console.error(e);
      }
      this.loading = false;
    },

    editItem(item) {
      this.editedIndex = this.policeStation.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

    async deleteItem(item) {
      this.loading = true;
      if (this.user.data.displayName === item.name && confirm("Chắc chắn là XÓA nha?")) {
        this.loading = true;
        try {
          // if (this.user.data.email === item.name) {
          await this.removePolice(item);
          this.loading = false;

          this.snack = true;
          this.snackColor = "success";
          this.snackText = "Xóa thông tin thành công";
          // }
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

      const status = await this.loadSaoKeCanhSatStatus();
      const statusDetail = status.data()
      if (statusDetail.actived) {
        if (this.editedIndex > -1) {
          // const current = new Date()
          const date = new Date();

          const hour = date.getUTCHours();
          const min = date.getUTCMinutes();
          const sec = date.getUTCSeconds();
          const year = date.getUTCFullYear();
          const month = date.getUTCMonth();
          const day = date.getUTCDate();
          const nowTimeAtDoctorPlace = `${hour + 7}:${min}:${sec}, ${day}/${month + 1}/${year}`

          this.editedItem.time = nowTimeAtDoctorPlace.toLocaleString()
          this.defaultItem.time = nowTimeAtDoctorPlace.toLocaleString()
          this.loading = true;
          try {
            await this.updatePolice({
              index: this.editedIndex,
              police: this.editedItem,
            });
            this.loading = false;
            this.close();

            this.snack = true;
            this.snackColor = "success";
            this.snackText = "Xóa thông tin thành công";
          } catch (e) {
            this.loading = false;
            this.close();

            this.snack = true;
            this.snackColor = "error";
            this.snackText = "Xóa thông tin không thành công";

            console.error(e);
          }
        } else {
          // this.editedItem.total = 1
          this.loading = true;
          // const current = new Date()
          const date = new Date();

          const hour = date.getUTCHours();
          const min = date.getUTCMinutes();
          const sec = date.getUTCSeconds();
          const year = date.getUTCFullYear();
          const month = date.getUTCMonth();
          const day = date.getUTCDate();
          const nowTimeAtDoctorPlace = `${hour + 7}:${min}:${sec}, ${day}/${month + 1}/${year}`

          this.editedItem.time = nowTimeAtDoctorPlace.toLocaleString()
          this.defaultItem.time = nowTimeAtDoctorPlace.toLocaleString()
          try {
            await this.addPolice(this.editedItem);
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
        if (confirm("Trạng thái Sao Kê hiện đang bị khóa. Vui lòng chờ Bác sĩ Hanwool kiểm tra")) {
          location.reload();
        }
      }
    },

    async exportPoliceStation() {
      this.loading = true;
      const currentDay = new Date().getDate();
      const currentMonth = new Date().getMonth() + 1;
      try {
        if (this.user.data.email === 'mynguyenngoc22@gmail.com') {
          const allStatus = await this.allstatus;
          await allStatus.forEach(async e => {
            if (e.id === "3LyZBzWwIsmLPGVGCQIu" && e.actived === true) {
              e.actived = false
              this.actived = false
              await this.updateStatus({
                index: this.editedIndex,
                status: e,
              });
            }
          })

          const data = this.policeStation;
          const fileName = "sao-ke-canh-sat-" + currentDay + "-" + currentMonth;
          const exportType = exportFromJSON.types.xls;

          if (data) exportFromJSON({ data, fileName, exportType });
        }
      } catch (e) {
        console.error(e);
      }
      this.loading = false;
    },

    async unlock() {
      this.loading = true;
      if (this.user.data.email === 'mynguyenngoc22@gmail.com') {
        const data = await this.allstatus;
        await data.forEach(async e => {
          if (e.id === "3LyZBzWwIsmLPGVGCQIu" && e.actived === false) {
            e.actived = true
            this.actived = true
            await this.updateStatus({
              index: this.editedIndex,
              status: e,
            });
          }
        })
      }
      this.loading = false;
    },

    async deleteAll() {
      this.loading = true;
      if (this.user.data.email === 'mynguyenngoc22@gmail.com' && confirm("Chắc chắn là XÓA HẾT đó nha?")) {
        this.loading = true;
        try {
          const data = this.policeStation;
          await data.forEach(async item => {
            await this.removePolice(item)
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
      } else {
        this.loading = false;
      }
    }
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
