import { GithubUser } from "./GithubSearch.js";
export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root)
    this.load();
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || []
  }

  save() {
    localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
  }
  delete(user) {
    const filteredEntries = this.entries.filter((entry) => entry.login !== user.login)
    this.entries = filteredEntries
    this.update()
    this.save()
  }

  async add(username) {
    try {

      const userExists = this.entries.find(entry => entry.login === username)

      if (userExists) {
        throw new Error('User Already added')
      }

      const user = await GithubUser.search(username)

      if (user.login === undefined) {
        throw new Error('Usuário não encontrado!')
      }

      this.entries = [user, ...this.entries]
      this.update()
      this.save()

    } catch (error) {
      alert(error.message)
    }
  }

}

export class FavoritesView extends Favorites {
  constructor(root) {
    super(root)
    this.tbody = this.root.querySelector('table tbody')
    this.update()
    this.onAdd()
  }

  onAdd() {
    const addButton = this.root.querySelector('.search-btn')
    addButton.onclick = () => {
      const { value } = this.root.querySelector('#search-bar')

      this.add(value)
    }
  }

  update() {
    this.emptyState();
    this.removeAllTr();
    this.entries.forEach((user) => {
      const row = this.createRow()
      row.querySelector('.user img').alt = `profile pic user ${user.name}`
      row.querySelector('.user img').src = `https://github.com/${user.login}.png`
      row.querySelector('.user p').textContent = user.name
      row.querySelector('.user span').textContent = user.login
      row.querySelector('.repositories').textContent = user.public_repos
      row.querySelector('.followers').textContent = user.followers
      row.querySelector('.user a').href = `https://github.com/${user.login}`
      row.querySelector('.remove').onclick = () => {
        const ok = confirm('do you really want to delete it?')
        if (ok) {
          this.delete(user)
        }
      }

      this.tbody.append(row)
    })

  }

  createRow() {

    const tr = document.createElement('tr')

    tr.innerHTML = ` 
            <td class="user">
              <img src="https://github.com/filipezzo.png" alt="">
              <a href="https://github.com/filipezzo" target="_blank">
                <p>Filipe Avanzzo</p>
                <span>filipezzo</span>
              </a>
            </td>
            <td class="repositories">23</td>
            <td class="followers">234</td>
            <td class="remove">Remove</td>
          `
    return tr

  }


  removeAllTr() {

    this.tbody.querySelectorAll('tr').forEach((tr) => {
      tr.remove()
    })
  }

  emptyState() {
    if (this.entries.length === 0) {
      this.root.querySelector('.empty-state').classList.remove('hide')
    } else {
      this.root.querySelector('.empty-state').classList.add('hide')
    }
  }

}
