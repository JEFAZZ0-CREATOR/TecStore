import React, { useEffect, useState } from 'react'
import { fetchProducts } from '../services/api'

export default function Store(){
  const [products, setProducts] = useState([])
  const [error, setError] = useState(null)

  useEffect(()=>{
    fetchProducts().then(res=>{
      // proyecto backend product list likely under res.success/data structure
      if(res.data) setProducts(res.data)
      else if(Array.isArray(res)) setProducts(res)
      else setProducts(res)
    }).catch(e=>setError(e.message))
  },[])

  return (
    <div>
      <h2>Tienda</h2>
      {error && <p className="error">{error}</p>}
      <div className="products">
        {products.length===0 && <p>No hay productos</p>}
        {products.map(p=> (
          <div key={p._id||p.id} className="product">
            <h3>{p.name || p.title || p.productName}</h3>
            <p>{p.description}</p>
            <p><strong>{p.price ? `$${p.price}` : ''}</strong></p>
          </div>
        ))}
      </div>
    </div>
  )
}
