<template>
  <div class="tags-container">
    <v-chip
        v-for="(tag, index) in tags"
        :key="index"
        bg-color="#22121"
        variant="outlined"
        size="small"
        class="ma-1 tag-chip"
    >
      {{ tag }}
    </v-chip>
  </div>
</template>

<script setup lang="ts">
defineProps<{ tags: string[] }>();
</script>

<style scoped>
.tags-container {
  display: flex;
  flex-wrap: wrap;
}
.tag-chip{
  color: #817cff;
  border-radius: 4px;
  cursor: default;
}
.tag-chip:hover {
  background-color: #817cff;
  color: white;
}
</style>
