from django.conf import settings

class DevAuthMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if settings.DEBUG:
            # Implement your devAuth logic here
            pass
        return self.get_response(request)
