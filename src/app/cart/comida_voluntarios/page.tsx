import lud06 from '@/constants/lud06/pos.json'
import Menu from '../components/menu'

const ComidaVoluntariosMenu = () => {
  return (
    <Menu
      name="comida_voluntarios"
      title="Comida (Voluntarios)"
      lud06={lud06}
    />
  )
}

export default ComidaVoluntariosMenu
