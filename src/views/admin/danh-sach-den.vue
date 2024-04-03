<template>
  <div>
    <v-data-table :headers="headers" :items="blacklistStorage" :search="search" class="elevation-1" :loading="loading"
      loading-text="Loading... Please wait">
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>Danh sách đen</v-toolbar-title>
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

                      <v-col cols="6" sm="6" md="6">
                        <v-text-field :disabled="loading" v-model="editedItem.debtInvoiceNumber"
                          label="Tổng số hóa đơn nợ" type="number">
                        </v-text-field>
                      </v-col>

                      <v-col cols="6" sm="6" md="6">
                        <v-text-field :disabled="loading" v-model="editedItem.totalPrice" label="Tổng tiền nợ"
                          type="number">
                        </v-text-field>
                      </v-col>

                      <v-col class="d-flex" cols="12" sm="12" md="12">
                        <v-select :items="allStatus" :disabled="loading" :rules="fieldRule" v-model="editedItem.status"
                          label="Trạng thái"></v-select>
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

          <v-dialog v-model="blacklistDialog" max-width="500px">
            <v-card>
              <v-card-title>
                <span class="headline">{{ formTitle }}</span>
              </v-card-title>

              <v-card-text>
                <v-container>
                  <v-form v-bind:disabled="loading" lazy-validation ref="blacklistDialogForm">
                    <v-row>
                      <v-col cols="12" sm="12" md="12">
                        <v-text-field :items="allStatus" :rules="fieldRule" v-model="editedItem.name" label="Tên">
                        </v-text-field>
                      </v-col>

                      <v-col cols="6" sm="6" md="6">
                        <v-text-field :items="allStatus" v-model="editedItem.debtInvoiceNumber"
                          label="Tổng số hóa đơn nợ" type="number">
                        </v-text-field>
                      </v-col>

                      <v-col cols="6" sm="6" md="6">
                        <v-text-field :items="allStatus" v-model="editedItem.totalPrice" label="Tổng tiền nợ"
                          type="number">
                        </v-text-field>
                      </v-col>

                      <v-col class="d-flex" cols="12" sm="12" md="12">
                        <v-select :items="allStatus" :disabled="loading" :rules="fieldRule" v-model="editedItem.status"
                          label="Trạng thái"></v-select>
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

          <v-btn v-if="isAdmin" text icon class="mb-2 ml-2" @click="deleteAll" color="error">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
          <v-btn v-if="isAdmin" text icon class="mb-2 ml-2" @click="exportBlacklist" color="#2E7D32">
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
            <v-icon dark v-bind="attrs" v-on="on" medium class="mr-2" @click="refreshItem(item)" color="primary">
              mdi-refresh
            </v-icon>
          </template>
          <span>Refresh</span>
        </v-tooltip>

        <v-tooltip top>
          <template v-slot:activator="{ on, attrs }">
            <v-icon v-if="isManageBlacklist" dark v-bind="attrs" v-on="on" medium class="mr-2"
              @click="validateItem(item)" color="warning">
              mdi-pencil
            </v-icon>
          </template>
          <span>Xem thông tin</span>
        </v-tooltip>

        <!-- <v-icon medium v-if="isAdmin" @click="editItem(item)" color="primary">
          mdi-pencil
        </v-icon> -->
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
// import * as utils from '../../utils/index';
import * as constants from '../../constants/index';

export default {
  data() {
    return {
      allStatus: ['Đang trong Blacklist', 'Đang chờ gỡ Blacklist', 'Đang bị Ban'],
      isManageBlacklist: false,

      isAdmin: false,
      snack: false,
      snackColor: "",
      snackText: "",
      search: "",
      loading: true,
      dialog: false,
      blacklistDialog: false,
      headers: [
        {
          text: "Tên",
          align: "start",
          sortable: true,
          value: "name",
        },
        {
          text: "Tổng số hóa đơn nợ",
          sortable: true,
          value: "debtInvoiceNumber",
        },
        {
          text: "Tổng tiền nợ",
          sortable: true,
          value: "totalPrice",
        },
        {
          text: "Trạng thái",
          sortable: true,
          value: "status",
        },
        { text: "Thao tác", value: "actions", sortable: false },
      ],
      editedIndex: -1,
      editedItem: {
        name: "",
        debtInvoiceNumber: "",
        status: "",
        totalPrice: ""
      },
      defaultItem: {
        name: "",
        debtInvoiceNumber: "",
        status: "",
        totalPrice: ""
      },
      fieldRule: [(v) => !!v || "Dữ liệu bắt buộc"],
      logItem: {
        name: "",
        category: "blacklist",
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
      loadBlacklistStorage: "blacklistStorage/loadBlacklistStorage",
    }),
    ...mapGetters({
      blacklistStorage: "blacklistStorage/getBlacklistStorage",
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
      addBlacklist: "blacklistStorage/addBlacklist",
      updateBlacklist: "blacklistStorage/updateBlacklist",
      removeBlacklist: "blacklistStorage/removeBlacklist",
      addLog: "logs/addLog",
      getAccount: "accounts/getAccount",
      getBlacklist: "blacklistStorage/getBlacklist",
    }),

    async initialize() {
      this.loading = true;
      this.logItem.name = this.user.data.displayName

      this.userData.uid = this.user.data.uid
      await this.getAccount(this.userData)
      const account = await this.getAccount(this.userData)

      if (account?.role?.includes("Admin") || constants.adminUser.includes(this.user.data.email)) {
        this.isAdmin = true
        this.isManageBlacklist = true
      }

      if (account?.role?.includes("BlacklistManager")) {
        this.isManageBlacklist = true
      }

      try {
        await this.loadBlacklistStorage;
      } catch (e) {
        console.error(e);
      }
      this.loading = false;
    },

    editItem(item) {
      this.editedIndex = this.blacklistStorage.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

    async validateItem(item) {
      const getNewData = await this.getBlacklist(item);
      const newData = getNewData.data()

      this.editedIndex = this.blacklistStorage.indexOf(item);
      this.editedItem = Object.assign({}, item);

      if (item.status !== newData.status) {
        this.editedItem.status = newData.status

        await this.updateBlacklist({
          index: this.editedIndex,
          blacklist: this.editedItem,
        });
      }

      this.blacklistDialog = true;
    },

    async refreshItem(item) {
      const getNewData = await this.getBlacklist(item);
      const newData = getNewData.data()

      this.editedIndex = this.blacklistStorage.indexOf(item);
      this.editedItem = Object.assign({}, item);

      if (item.status !== newData.status) {
        this.editedItem.status = newData.status

        await this.updateBlacklist({
          index: this.editedIndex,
          blacklist: this.editedItem,
        });
      }
    },

    async deleteItem(item) {
      this.loading = true;
      if (confirm("Chắc chắn là XÓA nha?")) {
        this.loading = true;
        try {
          await this.removeBlacklist(item);
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
            const data = this.blacklistStorage;
            await data.forEach(async item => {
              await this.removeBlacklist(item)
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
      this.blacklistDialog = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.validatedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },

    async save() {
      // if (!this.$refs.dialogForm.validate()) return;

      if (this.isAdmin || this.isManageBlacklist) {
        if (this.editedIndex > -1) {
          this.loading = true;
          try {
            await this.updateBlacklist({
              index: this.editedIndex,
              blacklist: this.editedItem,
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
            await this.addBlacklist(this.editedItem);
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
        this.snackText = "Bạn không có quyền tạo blacklist";
        this.loading = false;
      }
    },

    async exportBlacklist() {
      this.loading = true;
      const currentDay = new Date().getDate();
      const currentMonth = new Date().getMonth() + 1;
      try {
        if (this.isAdmin) {
          const data = this.blacklistStorage;
          const fileName = "danh-sach-den-" + currentDay + "-" + currentMonth;
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
            await this.addBlacklist(e);
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