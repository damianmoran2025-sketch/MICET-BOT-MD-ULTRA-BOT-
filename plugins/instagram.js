import fetch from 'node-fetch'

export default {
  command: ['instagram', 'ig', 'reel'],
  category: 'downloads',
  description: 'Descargar un reel de Instagram.',
  run: async ({ msg, sock, args, usedPrefix, command }) => {
    if (!args[0]) {
      return msg.reply('✳️ Por favor, ingrese un enlace de Instagram.')
    }
    if (!args[0].match(/instagram\.com\/(p|reel|share|tv|stories)\//)) {
      return msg.reply('✳️ El enlace no parece *válido*. Asegúrate de que sea de *Instagram*.')
    }
    try {
      const data = await getInstagramMedia(args[0])
      if (!data) return msg.reply('❇️ No se pudo obtener el contenido.')
      const caption = `ㅤ۟∩　ׅ　★ ໌　ׅ　🅘𝖦 🅓ownload　ׄᰙ\n\n${data.title ? `𖣣ֶㅤ֯⌗ ❀  ⬭ *Usuario* › ${data.title}\n` : ''}${data.caption ? `𖣣ֶㅤ֯⌗ ❀  ⬭ *Descripción* › ${data.caption}\n` : ''}${data.like ? `𖣣ֶㅤ֯⌗ ❀  ⬭ *Likes* › ${data.like}\n` : ''}${data.views ? `𖣣ֶㅤ֯⌗ ❀  ⬭ *Vistas* › ${data.views}\n` : ''}${data.duration ? `𖣣ֶㅤ֯⌗ ❀  ⬭ *Duración* › ${data.duration}\n` : ''}${data.format ? `𖣣ֶㅤ֯⌗ ❀  ⬭ *Formato* › ${data.format}\n` : ''}𖣣ֶㅤ֯⌗ ❀  ⬭ *Enlace* › ${args[0]}`
      if (data.type === 'video') {
        await sock.sendMessage(msg.chat, { video: { url: data.url }, caption, mimetype: 'video/mp4', fileName: 'ig.mp4' }, { quoted: msg })
      } else if (data.type === 'image') {
        await sock.sendMessage(msg.chat, { image: { url: data.url }, caption }, { quoted: msg })
      } else {
        throw new Error('Contenido no soportado.')
      }
    } catch (e) {
      await msg.reply(`> An unexpected error occurred while executing command *${usedPrefix + command}*. Please try again or contact support if the issue persists.\n> [Error: *${e.message}*]`)
    }
  }
}

async function getInstagramMedia(url) {
  const apis = [
    { endpoint: `${global.APIs.yuki.url}/dl/instagram?url=${encodeURIComponent(url)}&key=${global.APIs.yuki.key}`, extractor: (res) => {
        if (!res.status || !res.data || !res.data.length) return null
        const media = res.data[0]
        if (!media?.url) return null
        return { type: 'video', title: null, caption: null, resolution: null, format: 'mp4', url: media.url, thumbnail: media.thumbnail || null }
      }
    },
    { endpoint: `${global.APIs.ootaizumi.url}/downloader/instagram/v1?url=${encodeURIComponent(url)}`, extractor: (res) => {
        if (!res.status || !res.result?.media?.length) return null
        const media = res.result.media[0]
        if (!media?.url) return null
        return { type: media.isVideo ? 'video' : 'image', title: res.result.metadata?.author || null, caption: null, like: res.result.metadata?.like === -1 ? null : res.result.metadata?.like, views: res.result.metadata?.views || null, duration: res.result.metadata?.duration ? `${Math.round(res.result.metadata.duration)}s` : null, resolution: null, format: media.isVideo ? 'mp4' : 'jpg', url: media.url, thumbnail: res.result.ppc || null }
      }
    },
    { endpoint: `${global.APIs.delirius.url}/download/instagram?url=${encodeURIComponent(url)}`, extractor: (res) => {
        if (!res.status || !res.data || !res.data.length) return null
        const media = res.data[0]
        if (!media?.url) return null
        return { type: media.type || (media.url.includes('.mp4') ? 'video' : 'image'), title: null, caption: null, resolution: null, format: media.type === 'video' ? 'mp4' : 'jpg', url: media.url }
      }
    },
    { endpoint: `${global.APIs.zenzxz.url}/download/instagram?url=${encodeURIComponent(url)}`, extractor: (res) => {
        if (!res.status || !res.result) return null
        if (!res.result.url) return null
        return { type: res.result.is_video ? 'video' : 'image', title: res.result.username || null, caption: res.result.caption || null, resolution: null, format: res.result.is_video ? 'mp4' : 'jpg', url: res.result.url, thumbnail: res.result.thumbnail || null }
      }
    }
  ]

  for (const { endpoint, extractor } of apis) {
    try {
      const res = await fetch(endpoint).then(r => r.json())
      const result = extractor(res)
      if (result) return result
    } catch (error) {
      continue
    }
    await new Promise(r => setTimeout(r, 500))
  }
  return null
          }
