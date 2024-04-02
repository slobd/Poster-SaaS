from functools import wraps
from flask import request
import jwt


def JwtAuthGuard(function):
    @wraps(function)
    def validateToken(*args, **kwargs):
        if request.headers.get("Authorization"):
            token = request.headers.get("Authorization").split(' ')[1]
            decode = jwt.decode(token, options={"verify_signature": False})
            print (decode)
        return function(*args, **kwargs)
    return validateToken