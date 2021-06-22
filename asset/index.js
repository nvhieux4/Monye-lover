
const itemControl = (function() {
    function item(name,price) {
        this.name = name
        this.price = price
        this.id = new Date().toISOString()
    }
    function createItem(name,price) {
        return new item(name,price)
    }
    return {
        createItem
    }
})()

const uiControl = (function() {
    function add(item) {
        const id = item.id.slice(0,10)
        document.querySelector('.list').insertAdjacentHTML('beforeend',`
        <div class="card p-2 mb-3 justify-content-between flex-lg-row align-items-center">
                <span>${item.name} mất <strong>${item.price}đ</strong> vào ngày ${id}</span> 
                <button class="btn btn-small btn-info btn-edit" data-id="${item.id}" >Sửa</button>
            </div>
        `)
        renderTotal()
        document.getElementById('name').value = ''
        document.getElementById('price').value = ''
    }

    //render ra màn hình
    function render() {
        const list = LSControl.getListItem()
        document.querySelector('.list').innerHTML = ''
        list.forEach(element => {
            add(element)
        });
        renderTotal()
    }
    
    //render tổng tiền 
    function renderTotal(){
        document.querySelector('.total').innerText = `Tổng chi phí:${LSControl.totalList()}đ`
    }

    //sự kiện khi bấm button sửa
    function handleEdit(id) {
        const item = LSControl.getId(id)
        document.getElementById('btn-group').className = 'd-flex justify-content-between'
        document.getElementById('btn-add').classList.add('d-none')
        document.querySelector('.btn-save').dataset.id = item.id
        document.querySelector('.btn-remove').dataset.id = item.id
        document.getElementById('name').value = item.name
        document.getElementById('price').value = item.price
    }

    //reset lại form
    function resetForm() {
        document.getElementById('btn-group').className = 'd-none justify-content-between'
        document.getElementById('btn-add').classList.remove('d-none')
        document.querySelector('.btn-save').dataset.id = ''
        document.querySelector('.btn-remove').dataset.id = ''
        document.getElementById('name').value = ''
        document.getElementById('price').value = ''
    }


    // Toast function
function toast({ title = "", message = "", type = "info", duration = '' }) {
    const main = document.getElementById("toast");
    if (main) {
      const toast = document.createElement("div");
      // Auto remove toast
      const autoRemoveId = setTimeout(function () {
        main.removeChild(toast);
      }, duration + 1000);
  
      // Remove toast when clicked
      toast.onclick = function (e) {
        if (e.target.closest(".toast__close")) {
          main.removeChild(toast);
          clearTimeout(autoRemoveId);
        }
      };
  
      const icons = {
        success: "fas fa-check-circle",
        info: "fas fa-info-circle",
        warning: "fas fa-exclamation-circle",
        error: "fas fa-exclamation-circle"
      };
      const icon = icons[type];
      const delay = (duration / 1000).toFixed(2);
      console.log(delay)
      toast.classList.add("toast", `toast--${type}`);
     toast.style.animation = `slideInLeft ease .3s, fadeOut linear 1s ${delay}s forwards`; 
      toast.innerHTML = `
                      <div class="toast__icon">
                          <i class="${icon}"></i>
                      </div>
                      <div class="toast__body">
                          <h3 class="toast__title">${title}</h3>
                          <p class="toast__msg">${message}</p>
                      </div>
                      <div class="toast__close">
                          <i class="fas fa-times"></i>
                      </div>
                  `;
      main.appendChild(toast);
    }
  }
  
   
    return {
        add,
        render,
        handleEdit,
        resetForm,
        toast
    }

})()

const LSControl = (function(){
    function add(item) {
        const list = getListItem()
        list.push(item)
        localStorage.setItem('list',JSON.stringify(list))

    }
    function getListItem() {
        return JSON.parse(localStorage.getItem('list')) || []
    }

    function totalList() {
       const total = getListItem().reduce((result,current)=>{
            return (result + Number(current.price))
        },0)
        return total.toLocaleString()
    }

    function getId(id) {
        return getListItem().find(item => item.id === id)
    }

    function updateItem(id,{name,price}) {
        const list = getListItem()
        for(let i=0; i<list.length;i++) {
            if(list[i].id === id) {
                list[i].name = name
                list[i].price = price
                break
            }
        }
        localStorage.setItem('list',JSON.stringify(list))
    }

    function deleteItem(id) {
        const list = getListItem()
        const index = list.findIndex(item => item.id === id)
        list.splice(index,1)
        localStorage.setItem('list', JSON.stringify(list))
    }

    function deleteAll() {
        localStorage.removeItem('list')
    }
    return {
        add,
        getListItem,
        totalList,
        getId,
        updateItem,
        deleteItem,
        deleteAll
    }
})()

const app = (function(){
    function handle(){
        //render lại danh sách
        uiControl.render()


        document.querySelector(".form").addEventListener('submit', event => {
            event.preventDefault()
            const name = document.getElementById('name').value
            const price = document.getElementById('price').value
            if(name === "" && price === "") {
                uiControl.toast({
                    title: "Thất bại!",
                    message: "Vui lòng nhập lại.",
                    type: "error",
                    duration: 1000000
                  });
            }
            else{
                uiControl.toast({
                    title: "Thành công!",
                    message: "Bạn vừa thêm sản phầm thành công.",
                    type: "success",
                    duration: 5000000
                  });
              
                const item = itemControl.createItem(name,price)
                LSControl.add(item)
                uiControl.add(item)
            }
        })

        //khi ấn vào button sửa
        document.querySelector('.list').addEventListener('click',e=>{
            if(e.target.classList.contains('btn-edit')){
                const id = e.target.dataset.id
                uiControl.handleEdit(id)
            }
            
        })

        //khi ấn vào button lưu
        document.querySelector('.btn-save').addEventListener('click',e => {
            e.preventDefault()
            const id = document.querySelector('.btn-save').dataset.id
            const name = document.getElementById('name').value
            const price = document.getElementById('price').value
            if(name === "" && price === "") {
                uiControl.toast({
                    title: "Thất bại!",
                    message: "Vui lòng nhập lại ",
                    type: "error",
                    duration: 1000000
                  });
                }
            else{
                LSControl.updateItem(id,{name,price})
                uiControl.render()
                uiControl.resetForm()
            }
        })

        //khi ấn vào nút quay về
        document.querySelector('.btn-return').addEventListener('click',(e)=>{
           e.preventDefault()
            uiControl.resetForm()
        })

        //khi ấn vào nút xóa
        document.querySelector('.btn-remove').addEventListener('click', e=>{
            e.preventDefault()
            const id = document.querySelector('.btn-remove').dataset.id
            const item = LSControl.getId(id)
            const isConfirmed = confirm(`Bạn muốn xóa ${item.name}`)
            if(isConfirmed){
                LSControl.deleteItem(id)
                uiControl.render()
                uiControl.resetForm()
            }
        })
        
        //khi ấn vào nút xóa tất cả
        document.querySelector('.btn-delete-all').addEventListener('click', e => {
            e.preventDefault()
            const isConfirmed = confirm('Bạn có muốn xóa tất cả không?')
            if(isConfirmed){
                LSControl.deleteAll()
                uiControl.render()
            }

        })
    }
    return {
        handle
    }
})()

app.handle()

//Thông báo lỗi

