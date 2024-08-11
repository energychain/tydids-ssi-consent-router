$.fn.extend({
    tydisConsent: function(options) {          
      // Check if TyDIDs is already loaded (prefered!) if not load it via GitHub
      if(typeof window.TyDIDs == 'undefined') {
        $.getScript('https://energychain.github.io/tydids-core/dist/tydids.js', function() {
            // $.fn.tydisConsent(options);
            console.debug("TyDIDs loaded from external source. Consider loading it localy before loading this jQuery extension!");
        });
      }
      // Merge default options with user-provided options
      const parent = this;      
      $(this).on('change',async function(e) {        
        if ($(this).prop('checked')) { 
            $(this).attr('disabled','disabled');
            if($(parent).attr('submit')) {
                $('#'+$(parent).attr('submit')).attr('disabled','disabled');
            }
            function captureFormFields() {
                let formData = {};
              
                $('input, textarea, select').each(function() {
                  let $this = $(this);
                  let name = $this.attr('name');
                  let value = $this.val();
              
                  if (name) {
                    formData[name] = value;
                  }
                });
              
                return formData;
            }

            const payload = captureFormFields();
            const ssi = new window.TyDIDs.DecentralizedIdentityConsent(payload);
            const signAndDownload = async function() {                                
                await ssi.publish(); // Needs to be published before reveal - due to imudability
                const revealedSSI = await ssi.reveal();
                $('#hiddenSignature').val(revealedSSI.signature);
    
                revealedSSI["@context"] = location;
                revealedSSI["@type"] = "SSI";
                revealedSSI["@iat"] = Math.floor(new Date().getTime()/1000);
                const timeString = new Date().toISOString();
                const ssiObject = JSON.stringify(revealedSSI);
    
                const html = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Identity - ${revealedSSI.identity} - ${location}</title>
                        <script src="https://unpkg.com/tydids-validation@latest/dist/tydids.js"></script>                    
                         <script type="application/ld+json" id="ssiObject">
                            ${ssiObject}
                        </script>
                        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
                    </head>
                    <body>
                    <nav class="navbar navbar-expand-md sticky-top bg-body-tertiary shadow d-print-none">
                        <div class="container-fluid">
                            <h1 class="display-6" style="padding-top: 12px;"><a class="btn btn-lg fs-2" role="button" target="_blank" href="https://tydids.com/"><span style="color: #147a50;"><svg class="bi bi-database-check" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 16 16" style="margin-top: -12px;margin-right: 10px;">
                                            <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7m1.679-4.493-1.335 2.226a.75.75 0 0 1-1.174.144l-.774-.773a.5.5 0 0 1 .708-.708l.547.548 1.17-1.951a.5.5 0 1 1 .858.514Z"></path>
                                            <path d="M12.096 6.223A4.92 4.92 0 0 0 13 5.698V7c0 .289-.213.654-.753 1.007a4.493 4.493 0 0 1 1.753.25V4c0-1.007-.875-1.755-1.904-2.223C11.022 1.289 9.573 1 8 1s-3.022.289-4.096.777C2.875 2.245 2 2.993 2 4v9c0 1.007.875 1.755 1.904 2.223C4.978 15.71 6.427 16 8 16c.536 0 1.058-.034 1.555-.097a4.525 4.525 0 0 1-.813-.927C8.5 14.992 8.252 15 8 15c-1.464 0-2.766-.27-3.682-.687C3.356 13.875 3 13.373 3 13v-1.302c.271.202.58.378.904.525C4.978 12.71 6.427 13 8 13h.027a4.552 4.552 0 0 1 0-1H8c-1.464 0-2.766-.27-3.682-.687C3.356 10.875 3 10.373 3 10V8.698c.271.202.58.378.904.525C4.978 9.71 6.427 10 8 10c.262 0 .52-.008.774-.024a4.525 4.525 0 0 1 1.102-1.132C9.298 8.944 8.666 9 8 9c-1.464 0-2.766-.27-3.682-.687C3.356 7.875 3 7.373 3 7V5.698c.271.202.58.378.904.525C4.978 6.711 6.427 7 8 7s3.022-.289 4.096-.777M3 4c0-.374.356-.875 1.318-1.313C5.234 2.271 6.536 2 8 2s2.766.27 3.682.687C12.644 3.125 13 3.627 13 4c0 .374-.356.875-1.318 1.313C10.766 5.729 9.464 6 8 6s-2.766-.27-3.682-.687C3.356 4.875 3 4.373 3 4"></path>
                                        </svg><span style="background-color: rgb(255, 255, 255);">tydids</span></span><span style="color: #e6b41e;">IdentityConsent</span></a></h1><a class="navbar-brand d-none d-md-block" data-bs-toggle="tooltip" data-bss-tooltip data-bs-placement="bottom" title><button id="btnMyQR" class="btn btn-dark" type="button" style="display: none;"><svg class="bi bi-qr-code" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M2 2h2v2H2z"></path>
                                        <path d="M6 0v6H0V0zM5 1H1v4h4zM4 12H2v2h2z"></path>
                                        <path d="M6 10v6H0v-6zm-5 1v4h4v-4zm11-9h2v2h-2z"></path>
                                        <path d="M10 0v6h6V0zm5 1v4h-4V1zM8 1V0h1v2H8v2H7V1zm0 5V4h1v2zM6 8V7h1V6h1v2h1V7h5v1h-4v1H7V8zm0 0v1H2V8H1v1H0V7h3v1zm10 1h-1V7h1zm-1 0h-1v2h2v-1h-1zm-4 0h2v1h-1v1h-1zm2 3v-1h-1v1h-1v1H9v1h3v-2zm0 0h3v1h-2v1h-1zm-4-1v1h1v-2H7v1z"></path>
                                        <path d="M7 12h1v3h4v1H7zm9 2v2h-3v-1h2v-1z"></path>
                                    </svg></button></a>
                        </div>
                    </nav>
                    <div class="container" style="margin-top:60px;">
                        <div class="card">
                            <div class="card-header text-light" style="background:#147a50">
                                <h4>${revealedSSI.identity}</h4>
                            </div>
                            <div class="card-body">
                                <table border="0" class="table table-striped">
                                    <tr><td>Context</td><td>${revealedSSI["@context"]}</td></tr>
                                    <tr><td>Issued At</td><td>${timeString}</td></tr>
                                    <tr><td>Payload</td><td class="text-truncate">${revealedSSI.payload}</td></tr>
                                    <tr><td>Granted At</td><td id="grantedAt"></td></tr>
                                    <tr><td>Revoked At</td><td id="revokedAt"></td></tr>
                                </table>
                            </div>
                            <div class="card-footer">
                                <button id="revokeButton" class="btn btn-dark">Revoke</button>
                            </div>
                        </div>
                    </div>
                    </body>
                    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.0/jquery.min.js"></script>
                    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
                    <script>    
                        const consent = function() {               
                            const ssiObject = JSON.parse(document.getElementById('ssiObject').textContent);
                            const ssi = new window.TyDIDs.SSI(ssiObject.privateKey);
    
                            const revokeButton = document.getElementById("revokeButton");
                            revokeButton.addEventListener("click", async function() {    
                                revokeButton.setAttribute('disabled','disabled');                    
                                await ssi.revoke();
                                consent();
                            });
                            ssi.isPublishedAt().then(function(data) {
                                if(data >0) { $('#grantedAt').html(new Date(data * 1000).toISOString()); }
                            });
                            ssi.isRevokedAt().then(function(data) {
                                if(data >0) { $('#revokedAt').html(new Date(data * 1000).toISOString()); revokeButton.setAttribute('disabled','disabled'); }
                            });
                        }
                        consent();
                        setInterval(consent,60000);
                    </script>                
                    </html>
                `;                
                                            
                var blob = new Blob([html], { type: 'text/html' });
                blob.name = "ssi_" + revealedSSI.identity+".html";
                var url = URL.createObjectURL(blob);
                var a = document.createElement('a');
                a.href = url;
                a.download = "ssi_" + revealedSSI.identity + ".html"; 
                a.filename = "ssi_" + revealedSSI.identity + ".html";
                a.name = "ssi_" + revealedSSI.identity + ".html";               
               
                a.click(); 
                $(parent).val(revealedSSI.identity);
                if($(parent).attr('signature')) {
                    $('#'+$(parent).attr('signature')).val(revealedSSI.signature);
                }
                if($(parent).attr('payload')) {
                    $('#'+$(parent).attr('payload')).val(JSON.stringify(payload));
                }
                if($(parent).attr('identity')) {
                    $('#'+$(parent).attr('identity')).val(revealedSSI.identity);
                }
                $(parent).removeAttr('disabled'); 
                if($(parent).attr('submit')) {
                    $('#'+$(parent).attr('submit')).removeAttr('disabled');
                }                          
            }
            signAndDownload();
        }

      });

      return {};
    }
  });