export const productImageSrc = (imageUrl) => {
  if (!imageUrl) {
    return ''
  }
  return imageUrl
}

export const uploadProductImage = async (api, productId, file) => {
  const formData = new FormData()
  formData.append('file', file)
  const response = await api.post(`/products/${productId}/image`, formData, {
    headers: { 'Content-Type': undefined },
  })
  return response.data
}
