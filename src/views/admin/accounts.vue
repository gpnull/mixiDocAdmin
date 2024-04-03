<template>
  <div>
    <v-data-table :headers="headers" :items="accounts" :search="search" class="elevation-1" :loading="loading"
      loading-text="Loading... Please wait">
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>Quản Lý Tài Khoản</v-toolbar-title>
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
                        <v-text-field :disabled="loading" :rules="fieldRule" v-model="editedItem.fullName" label="Tên">
                        </v-text-field>
                      </v-col>
                      <v-col cols="12" sm="12" md="12">
                        <v-text-field :disabled="loading" :rules="fieldRule" v-model="editedItem.email" label="Email">
                        </v-text-field>
                      </v-col>
                      <v-col class="d-flex" cols="12" sm="12" md="12">
                        <v-select :items="roles" :disabled="loading" :rules="fieldRule" v-model="editedItem.role"
                          label="Vai trò trên hệ thống" attach chips multiple></v-select>
                      </v-col>
                      <!-- <v-col class="d-flex" cols="12" sm="12" md="12">
                        <v-select :items="status" disabled :rules="fieldRule" v-model="editedItem.status"
                          label="Trạng thái hoạt động"></v-select>
                      </v-col> -->
                      <v-col cols="12" sm="12" md="12">
                        <span>Intern: Thực tập </span><br>
                        <span>Doctor: Bác sĩ </span><br>
                        <span>ChiefDoctor: Bác sĩ trưởng </span><br>
                        <span>BlacklistManager: Bác sĩ quản lý Blacklist </span><br>
                        <span>VoucherManager: Bác sĩ quản lý Voucher </span><br>
                        <span>Admin: Admin </span><br>
                        <span>PauseWork: Tài khoản ngừng hoạt động </span><br>
                        <span>Support: Hỗ trợ </span><br>
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

          <v-dialog v-model="editDialog" max-width="500px">
            <v-card>
              <v-card-title>
                <span class="headline">{{ formTitle }}</span>
              </v-card-title>

              <v-card-text>
                <v-container>
                  <v-form v-bind:disabled="loading" lazy-validation ref="dialogForm">
                    <v-row>
                      <v-col cols="12" sm="12" md="12">
                        <v-text-field disabled v-model="editedItem.fullName" label="Tên">
                        </v-text-field>
                      </v-col>
                      <v-col cols="12" sm="12" md="12">
                        <v-text-field disabled v-model="editedItem.email" label="Email">
                        </v-text-field>
                      </v-col>
                      <v-col class="d-flex" cols="12" sm="12" md="12">
                        <v-select :items="roles" :disabled="loading" :rules="fieldRule" v-model="editedItem.role"
                          label="Vai trò trên hệ thống" attach chips multiple></v-select>
                      </v-col>

                      <v-col cols="12" sm="12" md="12">
                        <span>Intern: Thực tập </span><br>
                        <span>Support: Hỗ trợ </span><br>
                        <span>Doctor: Bác sĩ </span><br>
                        <span>ChiefDoctor: Bác sĩ trưởng </span><br>
                        <span>BlacklistManager: Bác sĩ quản lý Blacklist </span><br>
                        <span>VoucherManager: Bác sĩ quản lý Voucher </span><br>
                        <span>Admin: Admin </span><br>
                        <span>PauseWork: Tài khoản ngừng hoạt động </span><br>
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
        <v-icon medium v-if="isAdmin" @click="editItem(item)" color="primary">
          mdi-pencil
        </v-icon>

        <v-tooltip top>
          <template v-slot:activator="{ on, attrs }">
            <v-icon dark v-bind="attrs" v-on="on" small v-if="isAdmin" class="mr-2" @click="resetPassword(item)"
              color="warning">
              mdi-form-textbox-password
            </v-icon>
          </template>
          <span>Reset Password</span>
        </v-tooltip>

        <!-- <v-tooltip top>
          <template v-slot:activator="{ on, attrs }">
            <v-icon dark v-bind="attrs" v-on="on" medium v-if="isAdmin" @click="changeStatus(item)" color="primary">
              mdi-account-switch-outline
            </v-icon>
          </template>
          <span>Active / Deactive</span>
        </v-tooltip> -->

        <!-- <v-tooltip top>
          <template v-slot:activator="{ on, attrs }">
            <v-icon dark v-bind="attrs" v-on="on" medium v-if="isAdmin" @click="upgradeDoctor(item)" color="#69F0AE">
              mdi-account-arrow-up
            </v-icon>
          </template>
          <span>Upgrade Doctor</span>
        </v-tooltip> -->

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
import * as constants from '../../constants/index';

export default {
  data() {
    return {
      roles: ['Intern', 'Support', 'Doctor', 'ChiefDoctor', 'BlacklistManager', 'VoucherManager', 'Admin', 'PauseWork'],
      status: ['Active', 'Deactive'],
      isAdmin: false,
      snack: false,
      snackColor: "",
      snackText: "",
      search: "",
      loading: true,
      dialog: false,
      editDialog: false,
      headers: [
        {
          text: "Tên",
          align: "start",
          sortable: true,
          value: "fullName",
        },
        {
          text: "Email",
          sortable: true,
          value: "email",
        },
        {
          text: "Vai trò hệ thống",
          sortable: true,
          value: "role",
        },
        // {
        //   text: "Trạng thái hoạt động",
        //   sortable: true,
        //   value: "status",
        // },
        { text: "Thao tác", value: "actions", sortable: false },
      ],
      editedIndex: -1,
      editedItem: {
        fullName: "",
        email: "",
        role: ["Intern"],
        status: "Active",
        authUid: "",
      },
      defaultItem: {
        fullName: "",
        email: "",
        role: ["Intern"],
        status: "Active",
        authUid: "",
      },
      fieldRule: [(v) => !!v || "Dữ liệu bắt buộc"],
      dataSignup: {
        email: "",
        password: "112113",
        fullName: "",
      },
      resetPasswordInfo: {
        email: "",
      },
      userData: {
        uid: ""
      },
    };
  },

  computed: {
    ...mapActions({
      loadAccounts: "accounts/loadAccounts",
    }),
    ...mapGetters({
      accounts: "accounts/getAccounts",
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
      addAccount: "accounts/addAccount",
      updateAccount: "accounts/updateAccount",
      signUp: "auth/signUp",
      sendEmailresetPassword: "auth/sendEmailresetPassword",
      getAccount: "accounts/getAccount",
    }),

    async initialize() {
      this.loading = true;

      this.userData.uid = this.user.data.uid
      await this.getAccount(this.userData)
      const account = await this.getAccount(this.userData)

      if (account?.role?.includes("Admin") || constants.adminUser.includes(this.user.data.email)) {
        this.isAdmin = true
      }

      try {
        await this.loadAccounts;
      } catch (e) {
        console.error(e);
      }
      this.loading = false;
    },

    editItem(item) {
      this.editedIndex = this.accounts.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.editDialog = true;
    },

    async deleteItem(item) {
      this.loading = true;
      if (confirm("Chắc chắn là XÓA nha?")) {
        this.loading = true;
        try {
          await this.removeAccount(item);
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
      this.editDialog = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },

    async save() {
      if (!this.$refs.dialogForm.validate()) return;

      if (this.isAdmin) {
        if (this.editedIndex > -1) {
          this.loading = true;
          try {
            await this.updateAccount({
              index: this.editedIndex,
              account: this.editedItem,
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
            this.editedItem.email = this.editedItem.email.toLowerCase()
            this.dataSignup.email = this.editedItem.email.toLowerCase()
            this.dataSignup.fullName = this.editedItem.fullName

            const signupResult = await this.signUp(this.dataSignup)

            this.editedItem.authUid = signupResult.user.uid
            await this.addAccount(this.editedItem);
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
        this.snackText = "Bạn không có quyền đăng ký mới";
        this.loading = false;
      }
    },

    async upgradeDoctor(item) {
      this.loading = true;
      this.editedIndex = this.accounts.indexOf(item);
      this.editedItem = Object.assign({}, item);

      if (item.role === "Intern") {
        if (confirm(`Nâng chức vụ hệ thống của ${item.fullName} thành Doctor?`)) {
          try {
            this.editedItem.role = "Doctor"
            await this.updateAccount({
              index: this.editedIndex,
              account: this.editedItem,
            });

            this.snack = true;
            this.snackColor = "success";
            this.snackText = "Nâng chức vụ hệ thống của người này thành công";
            this.loading = false;
          } catch (e) {
            this.loading = false;

            this.snack = true;
            this.snackColor = "error";
            this.snackText = "Nâng chức vụ hệ thống của người này không thành công";

            console.error(e);
          }
        }
        this.loading = false;
        return
      } else {
        this.loading = false;

        this.snack = true;
        this.snackColor = "error";
        this.snackText = "Tài khoản đang có chức vụ Doctor";
      }

      this.loading = false;
    },

    async changeStatus(item) {
      this.loading = true;
      this.editedIndex = this.accounts.indexOf(item);
      this.editedItem = Object.assign({}, item);

      if (item.status === "Active") {
        if (confirm(`Chuyển trạng thái của ${item.fullName} thành Deactive?`)) {
          try {
            this.editedItem.status = "Deactive"
            await this.updateAccount({
              index: this.editedIndex,
              account: this.editedItem,
            });

            this.snack = true;
            this.snackColor = "success";
            this.snackText = "Chuyển trạng thái thành công";
            this.loading = false;
          } catch (e) {
            this.loading = false;

            this.snack = true;
            this.snackColor = "error";
            this.snackText = "Chuyển trạng thái không thành công";

            console.error(e);
          }
        }
        this.loading = false;
        return
      }

      if (item.status === "Deactive") {
        if (confirm(`Chuyển trạng thái của ${item.fullName} thành Active?`)) {
          try {
            this.editedItem.status = "Active"
            await this.updateAccount({
              index: this.editedIndex,
              account: this.editedItem,
            });

            this.snack = true;
            this.snackColor = "success";
            this.snackText = "Chuyển trạng thái thành công";
            this.loading = false;
          } catch (e) {
            this.loading = false;

            this.snack = true;
            this.snackColor = "error";
            this.snackText = "Chuyển trạng thái không thành công";

            console.error(e);
          }
        }
        this.loading = false;
        return
      }

      this.loading = false;
    },

    async resetPassword(item) {
      this.loading = true;

      // if (item.status === "Deactive") {
      //   this.loading = false;

      //   this.snack = true;
      //   this.snackColor = "error";
      //   this.snackText = "Tài khoản đang trong trạng thái Deactive";

      //   return
      // }

      if (confirm(`Reset password của: ${item.fullName} ?`)) {
        try {
          this.resetPasswordInfo.email = item.email
          await this.sendEmailresetPassword(this.resetPasswordInfo)

          this.snack = true;
          this.snackColor = "success";
          this.snackText = "Gửi mail đặt lại mật khẩu thành công";
          this.loading = false;
        } catch (e) {
          this.loading = false;

          this.snack = true;
          this.snackColor = "error";
          this.snackText = "Gửi mail đặt lại mật khẩu không thành công";

          console.error(e);
        }
      }

      this.loading = false;
    },

    async addOldData() {
      const data = null
      if (data) {
        try {
          data.forEach(async e => {
            await this.addAccount(e);
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