/*
 * Contact form validation
 *
 * Adapted by Ildar Sagdejev ( http://www.tknomad.com ) from:
 *   http://net.tutsplus.com/tutorials/html-css-techniques/build-a-neat-html5-powered-contact-form/
 */

var isEmail = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;

function flashInput( element ) {
  $(element).stop( true ).fadeTo( 160, 0.6 ).fadeTo( 200, 1 );
}

function contactFormSubmitEnable( container ) {
  var form = container.find('form'),
      fields = form.find('input[type!="submit"],textarea'),
      btnSubmit = form.find('[type="submit"]');

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

    if( valid && !infoWindowBusy ) {
      var success = container.find('#success');
      btnSubmit.attr( 'value', 'Submitting' );
      infoWindowBusy = true;

      $.ajax( {
        url: form.attr('action'),
        type: form.attr('method'),
        data: form.serialize(),
        success: function() {
          var subtitle = container.children('h2');
          subtitle.hide();
          form.hide();
          success.show();
          arrowKeysEnabled = true;

          $('#info-window').delay( 1300 ).fadeOut( 1800, function() {
            form.get(0).reset();
            btnSubmit.attr( 'value', 'Send' );
            success.hide();
            subtitle.show();
            form.show();
            infoWindowBusy = false;
          } );
        },
        error: function( request, status, httpError ) {
          btnSubmit.addClass( 'error' );
          btnSubmit.attr( 'value', 'Error' );

          setTimeout( function() {
            btnSubmit.removeClass( 'error' );
            btnSubmit.attr( 'value', 'Send' );
            infoWindowBusy = false;
          }, 1300 );
        }
      } );
    }

    // Prevent automatic submission and default error messages
    return false;
  } );
}

function contactFormShow() {
  infoShow( 'contact.html', '#contact-form', 267, 362, function( content ) {
    content.find('#name').focus();
    contactFormSubmitEnable( content );
    arrowKeysEnabled = false;
  } );
}

$(function() {
  $('#contact').click( contactFormShow );
});