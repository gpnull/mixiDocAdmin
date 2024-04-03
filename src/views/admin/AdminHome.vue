<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" app clipped>
      <v-list dense>
        <v-list-item-group color="primary">
          <v-list-item v-for="(menu, index) in menus" :key="index" @click="goto(menu.path)">
            <v-list-item-action>
              <v-icon>{{ menu.icon }}</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>{{ menu.title }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app clipped-left dark color="primary">
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>Hello.. <b>{{ this.user.data.displayName }}</b> !</v-toolbar-title>
      <v-spacer />
      <v-btn text icon @click="dark = !dark">
        <v-icon>{{ dark ? 'mdi-brightness-4' : 'mdi-brightness-6' }}</v-icon>
      </v-btn>
      <v-btn text icon @click="logOut()">
        <v-icon>mdi-power</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <v-row>
          <v-col>
            <router-view />
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <v-footer app>
      <div class="flex text-center">
        <span class="lead text--secondary text-center">👉
          <a href="https://docs.google.com/spreadsheets/d/12r6ltohx-M_SLqcxZETm93Weq-k7ljmq04naVQFMCLk/"
            class="text-decoration-none" target="_blank">Tất Tần Tật Bệnh Viện</a> 👈
        </span>
      </div>
    </v-footer>

    <v-snackbar v-model="snack" :timeout="5000" :color="snackColor">
      {{ snackText }}
      <template v-slot:action="{ attrs }">
        <v-btn v-bind="attrs" text @click="snack = false">Close</v-btn>
      </template>
    </v-snackbar>

    <v-dialog v-model="loggerDialog" max-width="420">
      <v-card>
        <v-card-title class="text-h5">
          Xem danh mục <br>
          Lịch Sử Thao Tác ?
        </v-card-title>

        <!-- <v-card-text>
          Xem mục này sẽ tiêu tốn tài nguyên của bạn và hệ thống, chỉ nên tra cứu mục này khi cần thiết
          <br><br>
          <b>Đồng ý</b> - để tiếp tục truy cập
          <br>
          <b>Dừng</b> - để dừng truy cập
        </v-card-text> -->

        <v-card-text>
          Xem mục này sẽ tiêu tốn tài nguyên của bạn và hệ thống, chỉ nên tra cứu mục này khi cần thiết
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" text @click="loggerDialog = false">
            Dừng
          </v-btn>
          <v-btn color="green darken-1" text @click="accessLogger">
            Đồng ý
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deactiveDialog" persistent max-width="320">
      <v-card>
        <v-card-title class="text-h5">
          Tài khoản đang bị khóa ?
        </v-card-title>
        <v-card-text>Tài khoản của bạn đã bị khóa, liên hệ bác sĩ Hanwool để xử lý.</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="green darken-1" text @click="logOut">
            Đã hiểu
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script>
import firebase from 'firebase';
import { mapActions, mapGetters } from 'vuex';
import * as constants from '../../constants/index';

export default {
  data: () => ({
    dark: false,
    path: '/mixi',
    drawer: null,
    menus: [
      // { path: '', title: 'Dashboard', icon: 'mdi-view-dashboard' },
      { path: '/hien-mau', title: 'Hiến Máu', icon: 'mdi-blood-bag' },
      { path: '/khoan-chi', title: 'Sao Kê Khoản Chi', icon: 'mdi-cash-multiple' },
      // { path: '/canh-sat', title: 'Sao Kê Cảnh Sát', icon: 'mdi-police-badge' },
      { path: '/vouchers', title: 'Voucher', icon: 'mdi-ticket-percent' },
      { path: '/bao-hiem-y-te', title: 'Bảo Hiểm Y Tế', icon: 'mdi-shield-plus' },
      { path: '/cu-dan-moi', title: 'Cư Dân Mới', icon: 'mdi-account-group' },
      { path: '/danh-sach-den', title: 'Blacklist', icon: 'mdi-coffin' },
      { path: '/logger', title: 'Lịch Sử Thao Tác', icon: 'mdi-clipboard-text-clock' },
      { path: '/accounts', title: 'Quản Lý Tài Khoản', icon: 'mdi-account-box' },
    ],
    internNotAccess: ['/logger', '/khoan-chi', '/accounts'],
    supportNotAccess: ['/khoan-chi', '/accounts'],
    loggerDialog: false,
    deactiveDialog: false,
    snack: false,
    snackColor: "",
    snackText: "",
    userData: {
      uid: ""
    },
    isAdmin: false,
    isIntern: false,
    isSupport: false,
    isActive: false
  }),
  created() {
    this.dark = this.$vuetify.theme.dark
    this.initialize();
  },
  computed: {
    ...mapActions({
    }),
    ...mapGetters({
      user: "auth/user",
    }),
  },
  methods: {
    ...mapActions({
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

      if (account?.role?.includes("Support")) {
        this.isSupport = true
      }

      if (account?.role?.includes("Intern")) {
        this.isIntern = true
      }

      if (account?.role?.includes("PauseWork")) {
        this.deactiveDialog = true
      }

      // if (account?.status === "Active") {
      //   this.isActive = true
      // }

      // if (!this.isActive && !constants.adminUser.includes(this.user.data.email)) {
      //   this.deactiveDialog = true
      // }

      this.loading = false;
    },

    logOut() {
      if (this.deactiveDialog) {
        this.deactiveDialog = false
      }
      firebase
        .auth()
        .signOut()
        .then(() => {
          this.$router.replace({ path: '/' });
        });
    },
    goto(newPath) {

      if (this.isIntern) {
        if (this.internNotAccess.includes(newPath)) {
          this.snack = true;
          this.snackColor = "error";
          this.snackText = `Bạn không thể truy cập vào danh mục này.`;

          return
        } else if (newPath === '/logger') {
          this.loggerDialog = true
        } else {
          this.$router.push({ path: this.path + newPath }).catch(() => { });
        }
      }

      if (this.isSupport) {
        if (this.supportNotAccess.includes(newPath)) {
          this.snack = true;
          this.snackColor = "error";
          this.snackText = `Bạn không thể truy cập vào danh mục này.`;

          return
        } else if (newPath === '/logger') {
          this.loggerDialog = true
        } else {
          this.$router.push({ path: this.path + newPath }).catch(() => { });
        }
      }

      if (newPath === '/logger') {
        this.loggerDialog = true
      } else if (newPath === '/accounts') {
        if (this.isAdmin) {
          this.$router.push({ path: this.path + newPath }).catch(() => { });
        } else {
          this.snack = true;
          this.snackColor = "error";
          this.snackText = `Danh mục dành cho Admin. Bạn không có đủ quyền hạn để truy cập.`;

          return
        }
      } else {
        this.$router.push({ path: this.path + newPath }).catch(() => { });
      }
    },

    accessLogger() {
      this.$router.push({ path: this.path + '/logger' }).catch(() => { });
      this.loggerDialog = false
    }
  },
  watch: {
    dark: function () {
      this.$vuetify.theme.dark = this.dark;
    }
  }
}
</script>