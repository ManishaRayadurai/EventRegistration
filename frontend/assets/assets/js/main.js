document.addEventListener("DOMContentLoaded", function(){

  // Register Page - Load Events
  const eventSelect = document.getElementById("eventSelect");
  if(eventSelect){
    fetch("/api/events")
      .then(res=>res.json())
      .then(events=>{
        eventSelect.innerHTML='<option value="">Select an Event</option>';
        events.forEach(ev=>{
          const option=document.createElement("option");
          option.value=ev.id;
          option.textContent=`${ev.title} (${ev.date})`;
          eventSelect.appendChild(option);
        });
      });

    // Form submit
    const regForm=document.getElementById("regForm");
    regForm.addEventListener("submit", function(e){
      e.preventDefault();
      const formData=new FormData(regForm);
      const payload={
        name: formData.get("name"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        college: formData.get("college"),
        eventId: formData.get("eventId")
      };
      fetch("/api/register", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(payload)
      })
      .then(res=>res.json())
      .then(data=>{
        const msg=document.getElementById("msg");
        if(data.success){
          msg.innerHTML=`<div class="alert alert-success">Registered for event!</div>`;
          regForm.reset();
        } else {
          msg.innerHTML=`<div class="alert alert-danger">${data.error}</div>`;
        }
      });
    });
  }

  // Participants Page
  const participantsList=document.getElementById("participantsList");
  if(participantsList){
    fetch("/api/participants")
      .then(res=>res.json())
      .then(participants=>{
        if(participants.length===0){
          participantsList.innerHTML="<p>No participants yet.</p>";
        } else {
          let html=`<table class="table table-striped"><thead><tr><th>#</th><th>Name</th><th>Email</th><th>Phone</th><th>College</th><th>Event</th></tr></thead><tbody>`;
          participants.forEach((p,i)=>{
            html+=`<tr><td>${i+1}</td><td>${p.name}</td><td>${p.email}</td><td>${p.phone}</td><td>${p.college}</td><td>${p.eventId}</td></tr>`;
          });
          html+=`</tbody></table><p>Total Participants: ${participants.length}</p>`;
          participantsList.innerHTML=html;
        }
      });
  }

  // Contact page
  const contactForm=document.getElementById("contactForm");
  if(contactForm){
    contactForm.addEventListener("submit", function(e){
      e.preventDefault();
      document.getElementById("contactMsg").innerHTML='<div class="alert alert-success">Message sent!</div>';
      contactForm.reset();
    });
  }

});
