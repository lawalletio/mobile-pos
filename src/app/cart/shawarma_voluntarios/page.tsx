import lud06 from '@/constants/lud06/pos.json'
import Menu from '../components/menu'

const ShawarmaVoluntariosMenu = () => {
  return (
    <Menu
      name="shawarma_voluntarios"
      title="Shawarma (Voluntarios)"
      lud06={lud06}
    />
  )
}

export default ShawarmaVoluntariosMenu
