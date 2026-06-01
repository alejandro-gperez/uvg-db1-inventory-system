FROM golang:1.26-alpine AS build

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /storehub-api .

FROM alpine:3.22

WORKDIR /app
COPY --from=build /storehub-api /usr/local/bin/storehub-api

EXPOSE 8080
CMD ["storehub-api"]
