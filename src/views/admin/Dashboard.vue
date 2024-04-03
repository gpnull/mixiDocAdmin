<template>
    <div>
        <v-container fluid>
            <v-img v-if="event" max-height="611" max-width="610"
                src="https://media.discordapp.net/attachments/1038006225230626856/1066380336998666271/cmnm.png?width=810&height=901">
            </v-img>
            <v-img v-else max-height="611" max-width="610"
                src="https://media.discordapp.net/attachments/977950271663644712/1011922943497994341/2.png?width=810&height=811">
            </v-img>
        </v-container>
    </div>
</template>

<script>
export default {
    data: () => ({
        event: false,
    }),
    created() {
        const currentYear = (new Date()).getFullYear()
        const currentMonth = (new Date()).getMonth() + 1
        const currentDate = (new Date()).getDate()
        if (currentYear === 2023 && currentMonth === 1) {
            if (currentDate >= 21 && currentDate <= 26) {
                this.event = true
            }
        }
    },
}
</script>