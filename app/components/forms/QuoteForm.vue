<script setup lang="ts">
import { isEmail, isNonEmpty } from '~/utils/validators'

type UploadedFile = { uploadId: string; filename: string; size: number; progress: number }
type LocalFile = {
  file: File
  progress: number
  uploadId?: string
  error?: string
  material: string
  quantity: string
}

const { t, tm } = useI18n()
const { request } = useApi()
const { upload } = useChunkedUpload()
const { getToken } = useTurnstile()

const ACCEPT = '.stl,.step,.stp,.obj,.3mf,.iges,.igs,.x_t,.x_b'
const materialOpts = computed(() => tm('quote.options.material') as string[])
const quantityOpts = computed(() => (tm('quote.options.quantity') as string[]).map((v) => ({ value: v, label: v })))
const millingOpts = computed(() => tm('quote.options.milling') as string[])

const form = reactive({
  milling: '',
  deadline: '',
  description: '',
  name: '',
  company: '',
  email: '',
  phone: '',
  consent: false,
})
const localFiles = ref<LocalFile[]>([])
const errors = ref<Record<string, string>>({})
const status = ref<'idle' | 'uploading' | 'submitting' | 'success' | 'error'>('idle')
const turnstileEl = ref<HTMLElement | null>(null)

function onFilesSelected(files: File[]) {
  for (const f of files) {
    localFiles.value.push({ file: f, progress: 0, material: '', quantity: '' })
  }
}
function removeFile(idx: number) {
  localFiles.value.splice(idx, 1)
}
function fmtBytes(n: number) {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`
  return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`
}

function validate() {
  const e: Record<string, string> = {}
  if (!isNonEmpty(form.name)) e.name = t('quote.fields.name')
  if (!isEmail(form.email)) e.email = t('quote.fields.email')
  if (!form.consent) e.consent = t('common.form.consent')
  if (localFiles.value.length === 0) e.files = t('quote.drop.title')
  for (const [i, f] of localFiles.value.entries()) {
    if (!isNonEmpty(f.material)) e[`file_${i}_material`] = t('quote.fields.material')
    if (!isNonEmpty(f.quantity)) e[`file_${i}_quantity`] = t('quote.fields.quantity')
  }
  errors.value = e
  return Object.keys(e).length === 0
}

async function uploadAll(): Promise<UploadedFile[]> {
  status.value = 'uploading'
  const out: UploadedFile[] = []
  for (let i = 0; i < localFiles.value.length; i++) {
    const entry = localFiles.value[i]
    if (entry.uploadId) {
      out.push({ uploadId: entry.uploadId, filename: entry.file.name, size: entry.file.size, progress: 100 })
      continue
    }
    try {
      const result = await upload(entry.file, (pct) => { entry.progress = pct })
      entry.uploadId = result.uploadId
      out.push({ ...result, progress: 100 })
    } catch (err) {
      entry.error = (err as Error).message
      throw err
    }
  }
  return out
}

async function onSubmit() {
  if (!validate()) return
  try {
    const uploaded = await uploadAll()
    status.value = 'submitting'
    const token = turnstileEl.value ? await getToken(turnstileEl.value) : 'dev-no-turnstile'
    await request('/quote/submit', {
      body: {
        milling: form.milling,
        deadline: form.deadline,
        description: form.description,
        name: form.name,
        company: form.company,
        email: form.email,
        phone: form.phone,
        files: uploaded.map((f, i) => ({
          upload_id: f.uploadId,
          filename: f.filename,
          size: f.size,
          material: localFiles.value[i].material,
          quantity: localFiles.value[i].quantity,
        })),
        turnstile_token: token,
      },
    })
    status.value = 'success'
  } catch {
    status.value = 'error'
  }
}
</script>

<template>
  <form class="bg-surface border border-border rounded-[var(--radius-xl)] p-8 md:p-10 max-w-[780px] mx-auto" @submit.prevent="onSubmit">
    <p class="font-mono text-[11px] text-accent tracking-wider mb-2">// {{ t('quote.section_project') }}</p>
    <h1 class="text-[28px] font-semibold tracking-tight mb-2">{{ t('quote.title') }}</h1>
    <p class="text-[14px] text-text-muted mb-8">{{ t('quote.lead') }}</p>

    <FileDropzone :accept="ACCEPT" @files-selected="onFilesSelected" />
    <p v-if="errors.files" class="text-[11px] text-red-600 mt-2">{{ errors.files }}</p>

    <ul class="mt-3 space-y-3">
      <li v-for="(entry, idx) in localFiles" :key="idx" class="p-3 bg-surface border border-border rounded-[var(--radius-md)] space-y-3">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 bg-accent text-white rounded-md flex items-center justify-center font-mono text-[10px] font-semibold">
            {{ entry.file.name.split('.').pop()?.toUpperCase().slice(0,3) }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-[13px] font-medium truncate">{{ entry.file.name }}</p>
            <p class="text-[11px] text-text-muted font-mono">
              {{ fmtBytes(entry.file.size) }}
              <span v-if="entry.progress > 0 && entry.progress < 100"> · {{ entry.progress }}%</span>
              <span v-if="entry.error" class="text-red-600"> · {{ entry.error }}</span>
            </p>
            <div v-if="entry.progress > 0 && entry.progress < 100" class="h-[3px] bg-border rounded mt-2 overflow-hidden">
              <div class="h-full bg-accent" :style="{ width: entry.progress + '%' }" />
            </div>
          </div>
          <button type="button" class="text-text-muted hover:text-text text-lg" @click="removeFile(idx)">×</button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-border">
          <div>
            <label class="block text-[11px] font-medium mb-1.5">{{ t('quote.fields.material') }} <span class="text-accent">*</span></label>
            <div class="flex gap-1.5 flex-wrap">
              <BasePill v-for="m in materialOpts" :key="m" :selected="entry.material === m" @click="entry.material = m">{{ m }}</BasePill>
            </div>
            <p v-if="errors[`file_${idx}_material`]" class="text-[11px] text-red-600 mt-1">{{ errors[`file_${idx}_material`] }}</p>
          </div>
          <div>
            <label class="block text-[11px] font-medium mb-1.5">{{ t('quote.fields.quantity') }} <span class="text-accent">*</span></label>
            <BaseSelect
              v-model="entry.quantity"
              :options="[{ value: '', label: '—' }, ...quantityOpts]"
              required
            />
            <p v-if="errors[`file_${idx}_quantity`]" class="text-[11px] text-red-600 mt-1">{{ errors[`file_${idx}_quantity`] }}</p>
          </div>
        </div>
      </li>
    </ul>

    <section class="mt-10">
      <p class="font-mono text-[11px] text-text-muted tracking-wider pb-3 border-b border-border">{{ t('quote.section_project') }}</p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <label class="block text-[12px] font-medium mb-1.5">{{ t('quote.fields.milling') }}</label>
          <div class="flex gap-2 flex-wrap">
            <BasePill v-for="opt in millingOpts" :key="opt" :selected="form.milling === opt" @click="form.milling = opt">{{ opt }}</BasePill>
          </div>
        </div>
        <div>
          <label class="block text-[12px] font-medium mb-1.5">{{ t('quote.fields.deadline') }}</label>
          <BaseInput v-model="form.deadline" :placeholder="t('quote.fields.deadline_placeholder')" />
        </div>
      </div>
      <div class="mt-4">
        <label class="block text-[12px] font-medium mb-1.5">{{ t('quote.fields.description') }}</label>
        <BaseTextarea v-model="form.description" :placeholder="t('quote.fields.description_placeholder')" />
      </div>
    </section>

    <section class="mt-10">
      <p class="font-mono text-[11px] text-text-muted tracking-wider pb-3 border-b border-border">{{ t('quote.section_contact') }}</p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <label class="block text-[12px] font-medium mb-1.5">{{ t('quote.fields.name') }} <span class="text-accent">*</span></label>
          <BaseInput v-model="form.name" autocomplete="name" />
          <p v-if="errors.name" class="text-[11px] text-red-600 mt-1">{{ errors.name }}</p>
        </div>
        <div>
          <label class="block text-[12px] font-medium mb-1.5">{{ t('quote.fields.company') }}</label>
          <BaseInput v-model="form.company" autocomplete="organization" />
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <label class="block text-[12px] font-medium mb-1.5">{{ t('quote.fields.email') }} <span class="text-accent">*</span></label>
          <BaseInput v-model="form.email" type="email" autocomplete="email" />
          <p v-if="errors.email" class="text-[11px] text-red-600 mt-1">{{ errors.email }}</p>
        </div>
        <div>
          <label class="block text-[12px] font-medium mb-1.5">{{ t('quote.fields.phone') }}</label>
          <BaseInput v-model="form.phone" type="tel" autocomplete="tel" />
        </div>
      </div>
    </section>

    <div class="mt-8 pt-6 border-t border-border flex flex-wrap items-center justify-between gap-4">
      <label class="flex items-start gap-2 text-[12px] text-text-muted max-w-[62%]">
        <input v-model="form.consent" type="checkbox" class="mt-0.5">
        <span>{{ t('common.form.consent') }}</span>
      </label>
      <BaseButton type="submit" variant="accent" :disabled="status === 'uploading' || status === 'submitting'">
        {{ status === 'uploading' ? t('common.form.submitting') :
           status === 'submitting' ? t('common.form.submitting') :
           t('quote.submit') }} →
      </BaseButton>
    </div>
    <p v-if="errors.consent" class="text-[11px] text-red-600 mt-2">{{ errors.consent }}</p>
    <div ref="turnstileEl" class="mt-3" />
    <p v-if="status === 'success'" class="text-[13px] text-accent mt-3">{{ t('common.form.success') }}</p>
    <p v-else-if="status === 'error'" class="text-[13px] text-red-600 mt-3">{{ t('common.form.error_generic') }}</p>
  </form>
</template>
