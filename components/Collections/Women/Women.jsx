import React from 'react'
import Hero from '@/components/homes/CatHero'
import Collections from './Collections'
import CategoryFaq from '../Common/CategoryFaq'

const Women = () => {
  return (
    <>
      <Hero />
      <Collections />
      <CategoryFaq type="women" />
    </>
  )
}

export default Women