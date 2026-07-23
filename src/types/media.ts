export type UploadMediaResponse = {
  cid: string
  url: string
}

/** GET /users/projects/medias/{mediaId} */
export type MediaMapperDto = {
  cid?: string
  mediaId?: string
  extension?: string
  title?: string
  url?: string
  fileName?: string
  fileSize?: number
  pinned?: boolean
  active?: boolean
  createdOn?: string
}
