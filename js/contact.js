/*
 * Contact form validation
 *
 * Adapted from: http://net.tutsplus.com/tutorials/html-css-techniques/build-a-neat-html5-powered-contact-form/
 */

var isEmail = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
var submitting = false;

function contactFormShow() {
  var form = $('#contact-form');
  form.fadeIn( 600 );
  form.find('#name').focus();
}

function contactFormClose() {
  if( !submitting )
    $('#contact-form').stop( true ).fadeOut( 400 );
}

function flashInput( element ) {
  $(element).stop( true ).fadeTo( 160, 0.6 ).fadeTo( 200, 1 );
}


$(function() {
  var form = $('#contact-form').find('form'),
      fields = form.find('input[type!="submit"],textarea'),
      btnSubmit = form.find('[type="submit"]');

  $('#contact').click( contactFormShow );
  $('#contact-form #close').click( contactFormClose );

  // 
  // An invalid HTML5 form element will not trigger a form submit event,
  // so we intercept the submit button click.
  //
  btnSubmit.bind( 'click', function() {
    var valid = true;

    fields.each( function() {
      var name = this.name,
          value = this.value;

      // If built-in HTML5 validity checking is supported, all is easy
      if( this.validity && !this.validity.valid )
        valid = false;
      
      if( valid && this.hasAttribute('required') )
        if( value == '' )
          valid = false;

      if( valid && this.getAttribute('type') == 'email' )
        if( !isEmail.test(value) )
          valid = false;

      if( !valid ) {
        this.focus();
        flashInput( this );
        return false;
      }
    } );

    if( valid && !submitting ) {
      var successBox = $('#contact-form #success');
      btnSubmit.attr( 'value', 'Submitting' );
      submitting = true;

      $.ajax( {
        url: form.attr('action'),
        type: form.attr('method'),
        data: form.serialize(),
        success: function() {
          var subtitle = $('#contact-form > h2');
          subtitle.hide();
          form.hide();
          successBox.show();

          $('#contact-form').delay( 1300 ).fadeOut( 1800, function() {
            form.get(0).reset();
            btnSubmit.attr( 'value', 'Send' );
            successBox.hide();
            subtitle.show();
            form.show();
            submitting = false;
          } );
        },
        error: function( request, status, httpError ) {
          btnSubmit.addClass( 'error' );
          btnSubmit.attr( 'value', 'Error' );

          setTimeout( function() {
            btnSubmit.removeClass( 'error' );
            btnSubmit.attr( 'value', 'Send' );
            submitting = false;
          }, 1300 );
        }
      } );
    }

    // Prevent automatic submission and default error messages
    return false;
  } );
});