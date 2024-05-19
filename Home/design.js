let docTitle = document.title;
window.addEventListener("blur", () =>{
    document.title = "Volte, seus passageiros o aguardam!";
})
window.addEventListener("focus", () =>{
    document.title = docTitle;
})


