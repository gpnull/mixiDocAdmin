<template>
  <div>
    <v-data-table :headers="headers" :items="logs" :search="search" class="elevation-1" :loading="loading"
      loading-text="Loading... Please wait">
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>Lịch Sử Thao Tác</v-toolbar-title>
          <v-divider class="mx-4" inset vertical />
          <v-spacer />

          <v-btn v-if="isAdmin" text icon class="mb-2 ml-2" @click="deleteAll" color="error">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
          <v-btn v-if="isAdmin" text icon class="mb-2 ml-2" @click="exportLogs" color="#2E7D32">
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
import * as constants from '../../constants/index';

export default {
  data() {
    return {
      isAdmin: false,
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
          text: "Danh mục",
          sortable: true,
          value: "category",
        },
        {
          text: "Nội Dung",
          sortable: true,
          value: "content",
        },
        {
          text: "Thời Gian",
          sortable: true,
          value: "time",
        },
      ],
      userData: {
        uid: ""
      },
    };
  },
  computed: {
    ...mapActions({
      loadLogs: "logs/loadLogs",
    }),
    ...mapGetters({
      logs: "logs/getLogs",
      user: "auth/user",
    }),
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
      removeLog: "logs/removeLog",
      getAccount: "accounts/getAccount",
    }),

    async initialize() {
      this.loading = true;
      try {
        await this.loadLogs;
      } catch (e) {
        console.error(e);
      }
      this.userData.uid = this.user.data.uid
      await this.getAccount(this.userData)
      const account = await this.getAccount(this.userData)

      if (account?.role?.includes("Admin") || constants.adminUser.includes(this.user.data.email)) {
        this.isAdmin = true
      }
      this.loading = false;
    },

    async exportLogs() {
      this.loading = true;
      const currentDay = new Date().getDate();
      const currentMonth = new Date().getMonth() + 1;
      try {
        if (this.isAdmin) {

          const data = this.logs;
          const fileName = "logs-" + currentDay + "-" + currentMonth;
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

    async deleteAll() {
      this.loading = true;
      if (this.isAdmin) {
        if (confirm("Chắc chắn là XÓA HẾT đó nha?")) {
          this.loading = true;
          try {
            const data = this.logs;
            await data.forEach(async item => {
              await this.removeLog(item)
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
