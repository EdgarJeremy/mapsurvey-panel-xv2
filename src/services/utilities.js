import swal from 'sweetalert';

export const inspect = function(form){
    let formData = new FormData(form);
    let object = {};
    formData.forEach((value, key) => {
        object[key] = value;
    });
    return object;
}

export const errorMsg = function(msg) {
    swal('Error', msg, 'error');
}